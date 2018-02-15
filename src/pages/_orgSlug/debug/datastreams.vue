<template>
  <div class="pt-header">
    <div v-if="progress < 100" class="px-3 py-3">
      <div class="progress">
        <div class="progress-bar" role="progressbar" :style="{width: `${progress}%`}"></div>
      </div>
    </div>

    <div v-show="progress === 100" ref="chart" class="h-viewport" />
  </div>
</template>

<script>
import Highcharts from 'highcharts/highstock'
// Deprecated
// import HighchartsMore from 'highcharts-more'
import Heatmap from 'highcharts/modules/heatmap'
import {TaskMachine} from '@dendra-science/task-machine'
import feathersClient from '@/lib/feathersClient'

if (process.client) {
  // Deprecated
  // HighchartsMore(Highcharts)
  Heatmap(Highcharts)
}

const Sources = {
  stations: {
    clear (model) {
      model.stations = null
      model.dataByStationAndSpec = {}
      model.specs = {}
    },

    guard (model) {
      return !model.stations
    },

    execute (model) {
      return feathersClient.service('/stations').find({query: {
        enabled: true,
        organization_id: model.$store.getters['organizations/current']._id,
        slug: {$exists: 1},
        $limit: 2000
      }})
    },

    assign (model, res) {
      model.stations = res.data
    }
  },

  datastreams: {
    clear (model) {
      model.stationIndex = 0
    },

    guard (model) {
      return model.stations &&
        (model.stationIndex < model.stations.length)
    },

    beforeExecute (model) {
      model.setProgress((model.stationIndex + 1) / model.stations.length * 100)
    },

    execute (model) {
      return feathersClient.service('/datastreams').find({query: {
        station_id: model.stations[model.stationIndex]._id,
        $limit: 2000
      }})
    },

    afterExecute (model, res) {
      return res.data
    },

    assign (model, res) {
      res.forEach(datastream => {
        const spec = datastream.tags_info && datastream.tags_info.resolved_terms
          .filter(term => term.scheme_id === 'ds')
          .map(term => `${term.vocabulary_label.substr(0, 3)}=${term.label}`)
          .sort()
          .join(', ')

        if (!spec) return

        const key = `${model.stations[model.stationIndex].slug}, ${spec}`
        const data = model.dataByStationAndSpec[key] = model.dataByStationAndSpec[key] || []

        data.push(datastream)

        model.specs[spec] = true
      })

      model.stationIndex++
    }
  }
}

export default {
  layout: 'bare',

  middleware: 'check-org',

  data () {
    return {
      progress: 0
    }
  },

  mounted () {
    const options = {
      chart: {
        type: 'heatmap',
        panning: true,
        plotBorderWidth: 0.5
      },

      title: {
        text: 'Number of Datastreams by Tag Spec and Station'
      },

      plotOptions: {
        series: {
          dataLabels: {
            overflow: 'none',
            crop: true,
            enabled: true,
            style: {
              fontWeight: 'normal'
            }
          }
        }
      },

      xAxis: {
        categories: [],
        scrollbar: {
          enabled: true
        },
        min: 0,
        max: 19
      },

      yAxis: {
        categories: [],
        reversed: true,
        scrollbar: {
          enabled: true
        },
        min: 0,
        max: 29
      },

      colorAxis: {
        min: 0,
        minColor: '#FFFFFF',
        maxColor: Highcharts.getOptions().colors[0]
      },

      legend: {
        enabled: false
      },

      tooltip: {
        formatter: function () {
          return `${this.series.xAxis.categories[this.point.x]}<br>${this.series.yAxis.categories[this.point.y]}<br><b>Datastreams: </b>${this.point.value}`
        }
      }
    }

    this.chart = Highcharts.chart(this.$refs.chart, options)

    this.loadData()
  },

  beforeDestroy () {
    this.destroyLoader()

    this.chart.destroy()
    this.chart = null
  },

  methods: {
    destroyLoader () {
      if (this.loader) this.loader.destroy()
      this.loader = null
    },

    loadData () {
      this.destroyLoader()

      this.loader = new TaskMachine({
        setProgress: this.setProgress,
        $store: this.$store
      }, Sources, {
        maxExecutions: 10000
      })

      return this.reloadData()
    },

    reloadData () {
      const loader = this.loader

      if (!loader) return

      return loader.clear().start().then(success => {
        const xCategories = loader.model.stations.map(station => station.slug).sort()
        const yCategories = Object.keys(loader.model.specs).sort()

        this.chart.update({
          xAxis: {
            categories: xCategories
          },

          yAxis: {
            categories: yCategories,
            title: null
          }
        })

        const seriesData = []

        xCategories.forEach((xCat, xInd) => {
          yCategories.forEach((yCat, yInd) => {
            const data = loader.model.dataByStationAndSpec[`${xCat}, ${yCat}`]

            if (data) {
              seriesData.push([xInd, yInd, data.length])
            } else {
              seriesData.push([xInd, yInd, 0])
            }
          })
        })

        this.chart.addSeries({
          borderWidth: 0.5,
          data: seriesData,
          dataLabels: {
            enabled: true,
            color: '#000000'
          },
          turboThreshold: 100000
        })

        this.setProgress(100)
      })
    },

    setProgress (value) {
      this.progress = value
    }
  }
}
</script>

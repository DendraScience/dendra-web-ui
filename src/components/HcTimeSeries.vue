<template>
  <div ref="chart" />
</template>

<script>
import Highcharts from 'highcharts'
import exporting from 'highcharts/modules/exporting'
import exportData from 'highcharts/modules/export-data'
import offline from 'highcharts/modules/offline-exporting'

exporting(Highcharts)
exportData(Highcharts)
offline(Highcharts)

export default {
  props: {
    bus: {
      default: null,
      type: Object
    },
    id: {
      default: 0,
      type: Number
    },
    exportChartOptions: {
      default: () => {},
      type: Object
    },
    options: {
      default: () => ({
        chart: {
          height: 500,
          zoomType: 'x'
        },
        title: {
          text: 'Time Series Chart'
        },
        xAxis: {
          crosshair: true,
          title: {
            text: 'Time'
          },
          type: 'datetime'
        },
        yAxis: [
          {
            title: {
              text: '(unit)'
            }
          }
        ]
      }),
      type: Object
    },
    seriesOptions: {
      default: () => [],
      type: Array
    },
    fetchSpec: {
      default: () => ({ queries: [] }),
      type: Object
    },
    worker: { default: null, type: Worker }
  },

  watch: {
    options(newValue) {
      this.chart.update(newValue)
    }
  },

  created() {
    // Handle HMR so we can debug
    // SEE: https://webpack.github.io/docs/hot-module-replacement.html
    if (module.hot) {
      this.worker.removeEventListener('message', this.workerMessageHandler)
    }
    this.worker.addEventListener('message', this.workerMessageHandler)
  },

  mounted() {
    this.chart = Highcharts.chart(this.$refs.chart, this.options)

    this.bus.$on('download-csv', this.downloadCSV)
    this.bus.$on('export', this.export)

    this.worker.postMessage({
      id: this.id,
      fetchSpec: this.fetchSpec
    })
  },

  beforeDestroy() {
    this.chart.destroy()
    this.chart = null

    this.worker.postMessage({
      id: this.id,
      cancel: true
    })
    this.worker.removeEventListener('message', this.workerMessageHandler)
  },

  methods: {
    downloadCSV() {
      const { chart } = this

      this.$nextTick(() => {
        if (chart) chart.downloadCSV()
      })
    },

    export(options) {
      const { chart } = this

      this.$nextTick(() => {
        if (chart) chart.exportChartLocal(options, this.exportChartOptions)
      })
    },

    removeAllSeries() {
      const { chart } = this
      if (!chart) return

      while (chart.series.length > 0) {
        chart.series[0].remove()
      }
    },

    workerMessageHandler(event) {
      const { data } = event

      if (data.id !== this.id) return

      if (data.isFetching === true) {
        this.removeAllSeries()
        this.chart.showLoading()
      }

      if (data.series) {
        const { series } = data
        const options = Object.assign(
          {
            step: true,
            zIndex: series.index
          },
          this.seriesOptions[series.index],
          { data: series.data }
        )
        this.chart.addSeries(options)
      }

      if (data.total) {
        this.chart.showLoading(`Loaded ${data.total} points...`)
      }

      if (data.isFetching === false) {
        this.chart.hideLoading()
      }
    }
  }
}
</script>

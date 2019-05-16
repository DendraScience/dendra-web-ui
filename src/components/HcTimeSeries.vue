<template>
  <div ref="chart" />
</template>

<script>
// import _ from 'lodash'
// import chroma from 'chroma-js'
import Highcharts from 'highcharts'

export default {
  props: {
    id: {
      default: 0,
      type: Number
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
    options(newOptions) {
      this.chart.update(newOptions)
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

    this.worker.postMessage({
      id: this.id,
      fetchSpec: this.fetchSpec
    })
  },

  beforeDestroy() {
    this.chart.destroy()
    this.chart = null

    this.worker.removeEventListener('message', this.workerMessageHandler)
  },

  methods: {
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

      if (data.series) {
        const { series, total } = data
        const options = Object.assign(
          {
            step: true,
            zIndex: series.index
          },
          this.seriesOptions[series.index],
          { data: series.data }
        )
        this.chart.addSeries(options)
        this.chart.showLoading(`Loaded ${total} points...`)
        return
      }

      if (data.isFetching) {
        this.removeAllSeries()
        this.chart.showLoading()
        return
      }

      if (data.isDone) {
        this.chart.hideLoading()
      }
    }
  }
}
</script>

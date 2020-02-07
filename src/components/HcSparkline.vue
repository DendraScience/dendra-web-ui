<template>
  <div ref="chart" class="grey lighten-4" style="width 100%;" />
</template>

<script>
import Highcharts from 'highcharts'

export default {
  props: {
    id: {
      default: 0,
      type: [Number, String]
    },
    options: {
      default: () => ({
        chart: {
          backgroundColor: null,
          borderWidth: 0,
          height: 24,
          margin: [0, 0, 0, 0],
          skipClone: true,
          spacing: [0, 0, 0, 0],
          width: 90
        },
        credits: { enabled: false },
        exporting: { enabled: false },
        time: { useUTC: false },
        legend: { enabled: false },
        plotOptions: {
          series: {
            animation: false,
            lineWidth: 1,
            marker: {
              radius: 0,
              states: {
                hover: { radius: 1 }
              }
            },
            shadow: false,
            states: {
              hover: { lineWidth: 1 }
            }
          }
        },
        title: { text: '' },
        tooltip: {
          hideDelay: 0,
          outside: true,
          shared: true,
          xDateFormat: '%a %Y-%m-%d %H:%M'
        },
        xAxis: {
          endOnTick: false,
          startOnTick: false,
          type: 'datetime',
          visible: false
        },
        yAxis: {
          endOnTick: false,
          startOnTick: false,
          visible: false
        }
      }),
      type: Object
    },
    seriesOptions: {
      default: () => [],
      type: Array
    },
    worker: { default: null, type: Worker }
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

      if (data.isFetching === true) {
        this.removeAllSeries()
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
    }
  }
}
</script>

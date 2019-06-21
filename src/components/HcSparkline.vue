<template>
  <div ref="chart" />
</template>

<script>
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
          backgroundColor: null,
          borderWidth: 0,
          margin: [2, 0, 2, 0],
          width: 80,
          height: 20,
          style: {
            overflow: 'visible'
          },
          skipClone: true
        },
        title: {
          text: ''
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        tooltip: {
          hideDelay: 0,
          outside: true,
          shared: true
        },
        xAxis: {
          labels: {
            enabled: false
          },
          title: {
            text: null
          },
          endOnTick: false,
          startOnTick: false,
          type: 'datetime'
        },
        yAxis: {
          labels: {
            enabled: false
          },
          title: {
            text: null
          },
          endOnTick: false,
          startOnTick: false
        }
        // plotOptions: {
        //       series: {
        //           animation: false,
        //           lineWidth: 1,
        //           shadow: false,
        //           states: {
        //               hover: {
        //                   lineWidth: 1
        //               }
        //           },
        //           marker: {
        //               radius: 1,
        //               states: {
        //                   hover: {
        //                       radius: 2
        //                   }
        //               }
        //           },
        //           fillOpacity: 0.25
        //       },
        //       column: {
        //           negativeColor: '#910000',
        //           borderColor: 'silver'
        //       }
        //   }
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
    // options(newValue) {
    //   this.chart.update(newValue)
    // }
  },

  created() {
    // Handle HMR so we can debug
    // SEE: https://webpack.github.io/docs/hot-module-replacement.html
    // if (module.hot) {
    //   this.worker.removeEventListener('message', this.workerMessageHandler)
    // }
    // this.worker.addEventListener('message', this.workerMessageHandler)
  },

  mounted() {
    this.chart = Highcharts.chart(this.$refs.chart, this.options)

    const options = Object.assign(
      {
        step: true
      },
      { data: [[100, 1], [101, 2], [102, 3]] }
    )
    this.chart.addSeries(options)

    // this.worker.postMessage({
    //   id: this.id,
    //   fetchSpec: this.fetchSpec
    // })
  },

  beforeDestroy() {
    this.chart.destroy()
    this.chart = null

    // this.worker.postMessage({
    //   id: this.id,
    //   cancel: true
    // })
    // this.worker.removeEventListener('message', this.workerMessageHandler)
  },

  methods: {
    // removeAllSeries() {
    //   const { chart } = this
    //   if (!chart) return
    //   while (chart.series.length > 0) {
    //     chart.series[0].remove()
    //   }
    // },
    // workerMessageHandler(event) {
    //   const { data } = event
    //   if (data.id !== this.id) return
    //   if (data.isFetching === true) {
    //     this.removeAllSeries()
    //     this.chart.showLoading()
    //   }
    //   if (data.series) {
    //     const { series } = data
    //     const options = Object.assign(
    //       {
    //         step: true,
    //         zIndex: series.index
    //       },
    //       this.seriesOptions[series.index],
    //       { data: series.data }
    //     )
    //     this.chart.addSeries(options)
    //   }
    //   if (data.total) {
    //     this.chart.showLoading(`Loaded ${data.total} points...`)
    //   }
    //   if (data.isFetching === false) {
    //     this.chart.hideLoading()
    //   }
    // }
  }
}
</script>

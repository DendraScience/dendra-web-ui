<template>
  <div ref="chart" />
</template>

<script>
import Highcharts from 'highcharts'
import _debounce from 'lodash/debounce'

const TOUCH_EVENTS = ['mousemove', 'touchmove', 'touchstart']

export default {
  props: {
    bus: {
      default: null,
      type: Object
    },
    id: {
      default: 0,
      type: [Number, String]
    },
    exportChartOptions: {
      default: () => {},
      type: Object
    },
    group: {
      default: 0,
      type: [Number, String]
    },
    options: {
      default: () => ({
        chart: {
          height: 500,
          zoomType: 'x'
        },
        exporting: { enabled: false },
        title: { text: 'Time Series Chart' },
        xAxis: {
          crosshair: true,
          title: { text: 'Time' },
          type: 'datetime'
        },
        yAxis: [
          {
            title: { text: '(unit)' }
          }
        ]
      }),
      type: Object
    },
    seriesOptions: {
      default: () => [],
      type: Array
    },
    syncCrosshairs: { default: false, type: Boolean },
    syncExtremes: { default: false, type: Boolean },
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

    /*
      WOOT: Far improved way of sync charts!!!
      Don't use: https://www.highcharts.com/demo/synchronized-charts
     */
    this.debouncedTouch = _debounce(e => {
      const { chart: thisChart } = this

      // Find coordinates within the chart
      const event = thisChart.pointer.normalize(e)
      if (!event) return

      let point

      for (let i = 0; i < thisChart.series.length; i++) {
        const series = thisChart.series[i]
        if (series.visible) {
          point = series.searchPoint(event, true)
          if (point) break
        }
      }

      if (!point) return

      for (let i = 0; i < Highcharts.charts.length; i++) {
        const chart = Highcharts.charts[i]

        if (!chart || chart === thisChart) continue

        for (let j = 0; j < chart.series.length; j++) {
          const series = chart.series[j]
          if (series.visible) {
            const index = series.processedXData.indexOf(point.x)

            if (index > -1) {
              const foundPoint = series.points[index]
              foundPoint.onMouseOver()
              chart.xAxis[0].drawCrosshair(null, foundPoint)
              break
            }
          }
        }
      }
    }, 200)
  },

  mounted() {
    const chartRef = this.$refs.chart
    this.chart = Highcharts.chart(chartRef, this.options)
    this.chart.__group = this.group

    if (this.syncCrosshairs)
      TOUCH_EVENTS.forEach(eventType =>
        chartRef.addEventListener(eventType, this.debouncedTouch)
      )

    if (this.bus) {
      this.bus.$on('download-csv', this.downloadCSV)
      this.bus.$on('export', this.export)
    }
  },

  beforeDestroy() {
    const chartRef = this.$refs.chart
    if (chartRef)
      TOUCH_EVENTS.forEach(eventType =>
        chartRef.removeEventListener(eventType, this.debouncedTouch)
      )

    this.debouncedTouch.cancel()
    this.debouncedTouch = null

    this.chart.destroy()
    this.chart = null

    if (this.bus) {
      this.bus.$off('download-csv', this.downloadCSV)
      this.bus.$off('export', this.export)
    }

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

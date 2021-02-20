<template>
  <div ref="chart" />
</template>

<script>
import Highcharts from 'highcharts'
import _debounce from 'lodash/debounce'
import _merge from 'lodash/merge'
import { GROUP_KEY, RENDERER_KEY, TOUCH_EVENTS } from '@/lib/chart'

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
    // NOTE: Not used
    // syncExtremes: { default: false, type: Boolean },
    tooltipContainerClass: { default: null, type: String },
    worker: { default: null, type: Worker }
  },

  watch: {
    options: {
      handler(newValue) {
        this.chart.update(this.makeChartOptions(newValue))
      },
      deep: true
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
    this.debouncedTouchHandler = _debounce(this.touchHandler, 100)
  },

  mounted() {
    const chartRef = this.$refs.chart
    this.chart = Highcharts.chart(chartRef, this.makeChartOptions(this.options))
    this.chart[GROUP_KEY] = this.group
    const { tooltipContainerClass } = this

    if (this.chart.tooltip && tooltipContainerClass) {
      // HACK: Monkey patch Highcharts to style the tooltip
      this.chart.tooltip[RENDERER_KEY] = this.chart.tooltip.renderer
      Object.defineProperty(this.chart.tooltip, 'renderer', {
        get() {
          return this[RENDERER_KEY]
        },
        set(value) {
          this.container.classList.add(tooltipContainerClass)
          this[RENDERER_KEY] = value
        }
      })
    }

    if (this.syncCrosshairs)
      TOUCH_EVENTS.forEach(eventType =>
        chartRef.addEventListener(eventType, this.debouncedTouchHandler)
      )

    if (this.bus) {
      this.bus.$on('download-csv', this.downloadCSV)
      this.bus.$on('export', this.export)
      this.bus.$on('get-extremes', this.getExtremes)
      this.bus.$on('reset-zoom', this.resetZoom)
      this.bus.$on('set-extremes', this.setExtremes)
    }
  },

  beforeDestroy() {
    const chartRef = this.$refs.chart
    if (chartRef)
      TOUCH_EVENTS.forEach(eventType =>
        chartRef.removeEventListener(eventType, this.debouncedTouchHandler)
      )

    this.debouncedTouchHandler.cancel()
    this.debouncedTouchHandler = null

    this.chart.destroy()
    this.chart = null

    if (this.bus) {
      this.bus.$off('download-csv', this.downloadCSV)
      this.bus.$off('export', this.export)
      this.bus.$off('get-extremes', this.getExtremes)
      this.bus.$off('reset-zoom', this.resetZoom)
      this.bus.$off('set-extremes', this.setExtremes)
    }

    this.worker.removeEventListener('message', this.workerMessageHandler)
  },

  methods: {
    afterSetExtremesHandler(e) {
      this.$emit('zoomed', !!e.userMin)
    },

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

    getExtremes(index) {
      /* eslint-disable-next-line no-console */
      console.log('xxx', this.chart.yAxis[index].getExtremes())
    },

    makeChartOptions(options) {
      const xAxisOptions =
        this.$listeners && this.$listeners.zoomed
          ? {
              xAxis: {
                events: {
                  afterSetExtremes: this.afterSetExtremesHandler
                }
              }
            }
          : null

      return _merge({}, xAxisOptions, options)
    },

    removeAllSeries() {
      const { chart } = this
      if (!chart) return

      while (chart.series.length > 0) {
        chart.series[0].remove()
      }
    },

    resetZoom() {
      const { chart } = this

      this.$nextTick(() => {
        if (chart) chart.zoomOut()
      })
    },

    setExtremes(index) {
      /* eslint-disable-next-line no-console */
      console.log('>>>', this.chart.yAxis[index].getExtremes())

      this.chart.yAxis[index].setExtremes(0, 10, true)
    },

    touchHandler(e) {
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

        if (
          chart &&
          chart !== thisChart &&
          chart[GROUP_KEY] === thisChart[GROUP_KEY]
        ) {
          for (let j = 0; j < chart.series.length; j++) {
            const series = chart.series[j]

            if (series.visible) {
              const otherPoint = series.searchPoint(
                {
                  chartX: chart.xAxis[0].toPixels(point.x, false),
                  chartY: event.chartY
                },
                true
              )
              if (otherPoint) {
                otherPoint.onMouseOver()
                chart.xAxis[0].drawCrosshair(null, otherPoint)
                break
              }
            }
          }
        }
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
            boostThreshold: 20,
            step: 'center',
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

<style>
.highcharts-reset-zoom {
  display: none !important;
}
</style>

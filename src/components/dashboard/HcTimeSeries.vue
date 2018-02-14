<template>
  <div ref="chart" />
</template>

<script>
import _ from 'lodash'
import chroma from 'chroma-js'
import dendraColors from '@dendra-science/colors'
import Highcharts from 'highcharts'
import {getByDot} from 'feathers-hooks-common'

export default {
  props: {
    channel: Object,
    options: Object
  },

  created () {
    this.seriesData = []
    this.seriesNames = []
  },

  mounted () {
    this.chart = Highcharts.chart(this.$refs.chart, this.options.chart)

    this.chart.showLoading()
  },

  beforeDestroy () {
    this.chart.destroy()
    this.chart = this.seriesData = this.seriesNames = null
  },

  methods: {
    removeAllSeries (chart) {
      while (chart.series.length > 0) {
        chart.series[0].remove()
      }
    }
  },

  watch: {
    // NOTE: The order of the watchers is significant!
    'channel.result': function (newResult) {
      if (!newResult) {
        this.removeAllSeries(this.chart)
        this.chart.showLoading()
        this.seriesData = []
        this.seriesNames = []
      } else if (this.seriesData) {
        let modResult = newResult

        const filterOpt = this.options.filter
        if (filterOpt) modResult = _.filter(modResult, filterOpt)

        const rejectOpt = this.options.reject
        if (rejectOpt) modResult = _.reject(modResult, rejectOpt)

        const orderByOpt = this.options.orderBy
        if (orderByOpt && Array.isArray(orderByOpt.iteratees)) {
          modResult = _.orderBy(modResult, orderByOpt.iteratees, orderByOpt.orders)
        }

        modResult.forEach((datastream, i) => {
          // Dynamically add series based on the number of datastreams
          if (i >= this.seriesData.length) {
            this.seriesData.push([])
            this.seriesNames.push(datastream.name || datastream._id)
          }

          // Append datapoints to series data
          if (datastream.datapoints && datastream.datapoints.data) {
            this.seriesData[i] = this.seriesData[i].concat(datastream.datapoints.data.map(point => {
              return [
                (new Date(point.t)).getTime() + (typeof point.o === 'number' ? point.o * 1000 : 0),
                typeof point.uv === 'number' ? point.uv : point.v
              ]
            }))
          }
        })
      }
    },

    'channel.cursor': function (newCursor) {
      // TODO: Consider DESC series
      if (newCursor && (newCursor.start >= newCursor.end)) {
        const colorsOpt = this.options.colors
        const seriesLen = this.seriesData.length
        let seriesColors

        if (typeof colorsOpt === 'string') {
          const dc = getByDot(dendraColors, colorsOpt)
          if (!dc) {
            seriesColors = chroma.scale(colorsOpt).colors(seriesLen)
          } else if (Array.isArray(dc) && dc.length > 0) {
            seriesColors = dc.length > 1 && seriesLen > 1 ? chroma.scale(dc).colors(seriesLen) : [dc[0]]
          }
        } else if (Array.isArray(colorsOpt) && colorsOpt.length > 0) {
          const mc = colorsOpt.map(c => {
            const dc = getByDot(dendraColors, c)
            return typeof dc === 'string' ? dc : c
          })
          seriesColors = mc.length > 1 && seriesLen > 1 ? chroma.scale(mc).colors(seriesLen) : [mc[0]]
        }

        this.seriesData.forEach((data, i) => {
          const opts = {
            data: data,
            name: this.seriesNames[i],
            step: true,
            zIndex: i > 0 ? i : 100
          }
          if (seriesColors && seriesColors[i]) opts.color = seriesColors[i]
          this.chart.addSeries(opts)
        })

        this.seriesData = this.seriesNames = null

        this.chart.hideLoading()
        // TODO: Deal with title, dynamic???
        // this.chart.setTitle({
        //   text: `xxx`
        // })

        this.$emit('series-added')
      }
    },

    'options': function (newOptions) {
      this.chart.update(newOptions.chart)
    }
  }
}
</script>

import Highcharts from 'highcharts'
import boost from 'highcharts/modules/boost'
import exporting from 'highcharts/modules/exporting'
import exportData from 'highcharts/modules/export-data'
import offline from 'highcharts/modules/offline-exporting'
import vuetifyColors from 'vuetify/lib/util/colors'

boost(Highcharts)
exporting(Highcharts)
exportData(Highcharts)
offline(Highcharts)

Highcharts.setOptions({
  colors: [
    vuetifyColors.blue.base,
    vuetifyColors.grey.darken3,
    vuetifyColors.green.lighten1,
    vuetifyColors.orange.base,
    vuetifyColors.indigo.lighten1,
    vuetifyColors.pink.lighten2,
    vuetifyColors.lime.darken2,
    vuetifyColors.teal.darken1,
    vuetifyColors.red.darken2,
    vuetifyColors.cyan.lighten1
  ],
  lang: {
    thousandsSep: ','
  }
})

Highcharts.wrap(
  Highcharts.Pointer.prototype,
  'reset',
  function (p, allowMove, delay) {
    if (this.chart.options.chart.resetPointer === false) return undefined

    return p.call(this, allowMove, delay)
  }
)

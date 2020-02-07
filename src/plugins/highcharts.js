import Highcharts from 'highcharts'
import boost from 'highcharts/modules/boost'
import exporting from 'highcharts/modules/exporting'
import exportData from 'highcharts/modules/export-data'
import offline from 'highcharts/modules/offline-exporting'

boost(Highcharts)
exporting(Highcharts)
exportData(Highcharts)
offline(Highcharts)

Highcharts.setOptions({
  lang: {
    thousandsSep: ','
  }
})

Highcharts.wrap(Highcharts.Pointer.prototype, 'reset', function(
  p,
  allowMove,
  delay
) {
  if (this.chart.options.chart.resetPointer === false) return undefined

  return p.call(this, allowMove, delay)
})

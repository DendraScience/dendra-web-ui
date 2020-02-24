import Highcharts from 'highcharts'

export function defaultOptions(title = '', subtitle = '') {
  return {
    chart: {
      height: 500,
      resetPointer: false,
      zoomType: 'x'
    },
    exporting: {
      chartOptions: {
        plotOptions: {
          series: {
            dataLabels: { enabled: true }
          }
        }
      },
      fallbackToExportServer: false
    },
    navigation: {
      buttonOptions: { enabled: false }
    },
    plotOptions: {
      series: {
        states: {
          inactive: { opacity: 0.9 }
        }
      }
    },
    subtitle: {
      text: subtitle
    },
    title: {
      text: title
    },
    tooltip: {
      shared: true,
      xDateFormat: '%a %Y-%m-%d %H:%M'
    },
    xAxis: {
      crosshair: true,
      events: {
        setExtremes: syncExtremes
      },
      title: { text: 'Time' },
      type: 'datetime'
    },
    yAxis: []
  }
}

export function syncExtremes(e) {
  const thisChart = this.chart

  // Prevent feedback loop
  if (e.trigger !== 'syncExtremes') {
    Highcharts.charts.forEach(function(chart) {
      if (chart && chart !== thisChart && chart.__group === thisChart.__group) {
        if (chart.xAxis[0].setExtremes) {
          // It is null while updating
          chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            trigger: 'syncExtremes'
          })
        }
      }
    })
  }
}

import Highcharts from 'highcharts'

export const CONTAINER_KEY = '___container'
export const GROUP_KEY = '___group'
export const RENDERER_KEY = '___renderer'
export const TOUCH_EVENTS = ['mousemove', 'touchmove', 'touchstart']

export function defaultOptions(title = '', subtitle = '') {
  return {
    chart: {
      height: 500,
      resetPointer: false,
      resetZoomButton: {
        theme: {
          display: 'none'
        }
      },
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
    legend: {
      enabled: true
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
      // useHTML: true,
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
    Highcharts.charts.forEach(function (chart) {
      if (
        chart &&
        chart !== thisChart &&
        chart[GROUP_KEY] === thisChart[GROUP_KEY]
      ) {
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

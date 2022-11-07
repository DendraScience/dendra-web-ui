export const exportItems = [
  {
    event: 'export',
    options: {
      sourceHeight: 450,
      sourceWidth: 800,
      type: 'image/jpeg'
    },
    title: 'JPEG image'
  },
  {
    event: 'export',
    options: {
      sourceHeight: 450,
      sourceWidth: 800
    },
    title: 'PNG image'
  },
  {
    event: 'export',
    options: {
      sourceHeight: 450,
      sourceWidth: 800,
      type: 'image/svg+xml'
    },
    title: 'SVG image'
  },
  // NOTE: Disabled since Highcharts PDF export is broken
  // {
  //   event: 'export',
  //   options: {
  //     sourceHeight: 450,
  //     sourceWidth: 800,
  //     type: 'application/pdf'
  //   },
  //   title: 'PDF document'
  // },
  {
    download: true,
    event: 'download-csv',
    title: 'CSV file'
  }
]

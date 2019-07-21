export default (_, inject) => {
  inject('dateFormats', {
    hm12: 'h:mm a',

    y2md: 'YY-MM-DD',
    y4md: 'YYYY-MM-DD'
  })
}

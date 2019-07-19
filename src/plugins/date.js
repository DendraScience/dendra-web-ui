export default (_, inject) => {
  inject('dateFormats', {
    timeRegex: /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/,

    y2md: 'YY-MM-DD',
    y4md: 'YYYY-MM-DD'
  })
}

import loadGoogleMapsAPI from 'load-google-maps-api'

export default (_, inject) => {
  inject('maps', () => {
    return loadGoogleMapsAPI({
      key: process.env.googleMapsAPIKey
    })
  })
}

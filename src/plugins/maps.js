import loadGoogleMapsAPI from 'load-google-maps-api'

export default (_, inject) => {
  inject('maps', () =>
    loadGoogleMapsAPI({
      key: window.__env.googleMapsAPIKey || process.env.googleMapsAPIKey
    })
  )
}

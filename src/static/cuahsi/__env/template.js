window.__env = {}
function initEnv(e) {
  e.apiPath = '$API_PATH'
  e.apiURI = '$API_URI'
  e.apiRPC = '$API_RPC'
  e.googleMapsAPIKey = '$GOOGLE_MAPS_API_KEY'
  e.googleTrackingId = '$GOOGLE_TRACKING_ID'
  e.noaaNWSIcons = '$NOAA_NWS_ICONS_URL'
  e.plausableDomain = '$PLAUSABLE_DOMAIN'
  e.plausableEnabled = '$PLAUSABLE_ENABLED'
  e.webSiteURL = '$WEB_SITE_URL'
  Object.keys(e).forEach(key => {
    if (e[key].charAt(0) === '$') delete e[key]
  })
}
initEnv(window.__env)

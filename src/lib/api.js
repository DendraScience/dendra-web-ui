const apiPath = process.env.apiPath
const apiUri = process.env.apiUri
const isIpv4 = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(location.hostname)
const parts = location.hostname.split('.')

// Reasonable defaults for development
const api = {
  path: '',
  uri: 'http://localhost:3030'
}

// Production build automatic overrides
if (process.env.NODE_ENV === 'production' && !isIpv4 && parts.length >= 2) {
  if (parts.length > 3) parts.shift()

  parts.unshift('api')

  api.path = '/v2'
  api.uri = `https://${parts.join('.')}`
}

// Build time environment variable overrides
if (apiPath) api.path = apiPath
if (apiUri) api.uri = apiUri

export default api

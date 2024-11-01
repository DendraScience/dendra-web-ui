const apiPath = window.__env.apiPath || process.env.apiPath
const apiURI = window.__env.apiURI || process.env.apiURI
const apiRPC = window.__env.apiRPC || process.env.apiRPC
const isIPv4 = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(location.hostname)
const parts = location.hostname.split('.')

// Reasonable defaults for development
const api = {
  path: '',
  uri: 'http://localhost:3030',
  rpc: 'http://localhost:8080'
}

// Production build automatic overrides
if (process.env.NODE_ENV === 'production' && !isIPv4 && parts.length >= 2) {
  if (parts.length > 3) parts.shift()

  parts.unshift('api')

  api.path = '/v2'
  api.uri = `https://${parts.join('.')}`
  api.rpc = api.uri.replace('api.', 'rpc.')
}

// Build time environment variable overrides
if (apiPath) api.path = apiPath
if (apiURI) api.uri = apiURI
if (apiRPC) api.rpc = apiRPC

export default api

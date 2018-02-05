import feathers from 'feathers/client'
import hooks from 'feathers-hooks'
import socketio from 'feathers-socketio/client'
import auth from 'feathers-authentication-client'
import io from 'socket.io-client'
import feathersStorage from './feathersStorage'
import logger from '@dendra-science/console-logger'

/*
  Feathers client connection settings are derived as follows:
  1. Start with webpack replacements, e.g. process.env.WEB_UI_API_PATH (see nuxt.config.js)
  2. If client, then overlay settings from __PROCESS_ENV__ (injected by the process-env module)
  3. If client, then WEB_UI_CLIENT_API_PATH/URI overrides WEB_UI_API_PATH/URI
  3. If server, then overlay settings from process.env
 */

const defaultEnv = {
  WEB_UI_API_PATH: process.env.WEB_UI_API_PATH,
  WEB_UI_API_URI: process.env.WEB_UI_API_URI,
  WEB_UI_CLIENT_API_PATH: process.env.WEB_UI_CLIENT_API_PATH,
  WEB_UI_CLIENT_API_URI: process.env.WEB_UI_CLIENT_API_URI
}

const ENV_KEYS = [
  'WEB_UI_API_PATH',
  'WEB_UI_API_URI',
  'WEB_UI_CLIENT_API_PATH',
  'WEB_UI_CLIENT_API_URI'
]

const overlayEnv = process.client ? window.__PROCESS_ENV__ : ENV_KEYS.reduce((env, key) => {
  const val = process.env[key]
  if (typeof val !== 'undefined') env[key] = val
  return env
}, {})

const env = Object.assign({}, defaultEnv, overlayEnv)
const p = (process.client && env.WEB_UI_CLIENT_API_PATH) || env.WEB_UI_API_PATH
const u = (process.client && env.WEB_UI_CLIENT_API_URI) || env.WEB_UI_API_URI

logger.info(`Configuring Feathers client: ${u}${p}`)

const socket = io(u, {
  path: p,
  transports: ['websocket']
})

const feathersClient = feathers()
  .configure(hooks())
  .configure(socketio(socket))
  .configure(auth({
    storage: feathersStorage
  }))

export default feathersClient

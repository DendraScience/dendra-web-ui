import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'
import logger from '@dendra-science/console-logger'

const apiPath = process.env.apiPath
const apiUri = process.env.apiUri

logger.info(`Configuring Feathers client: ${apiUri}${apiPath}`)

const socket = io(apiUri, {
  path: apiPath,
  transports: ['websocket']
})

const feathersClient = feathers()
  .configure(socketio(socket))
  .configure(auth({ storage: window.localStorage }))

export default feathersClient

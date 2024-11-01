import canopyPluginInit from './canopy-module'
import passportPluginInit from './passport-module'
import sessionPluginInit from './session-module'

export default (feathersClient, api) => {
  return {
    canopy: canopyPluginInit(feathersClient, api),
    passport: passportPluginInit(feathersClient, api),
    session: sessionPluginInit(feathersClient, api)
  }
}

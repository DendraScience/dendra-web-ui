import passportPluginInit from './passport-module'
import sessionPluginInit from './session-module'

export default feathersClient => {
  return {
    passport: passportPluginInit(feathersClient),
    session: sessionPluginInit(feathersClient)
  }
}

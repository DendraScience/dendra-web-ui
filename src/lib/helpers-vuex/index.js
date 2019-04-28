import passportPluginInit from './passport-module'

export default feathersClient => {
  return {
    passport: passportPluginInit(feathersClient)
  }
}

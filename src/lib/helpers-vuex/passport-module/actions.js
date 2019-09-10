export default feathersClient => {
  return {
    getJWT() {
      return feathersClient.passport.getJWT()
    },

    // TODO: Deprecated?
    // payloadIsValid(_, token) {
    //   return feathersClient.passport.payloadIsValid(token)
    // },

    verifyJWT(_, token) {
      return feathersClient.passport.verifyJWT(token)
    }
  }
}

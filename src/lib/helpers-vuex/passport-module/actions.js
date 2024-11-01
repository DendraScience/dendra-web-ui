export default feathersClient => {
  return {
    getJWT() {
      return feathersClient.passport.getJWT()
    },

    verifyJWT(_, token) {
      return feathersClient.passport.verifyJWT(token)
    }
  }
}

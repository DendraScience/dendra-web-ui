export default feathersClient => {
  return {
    setTokenExpired(state) {
      state.isTokenExpired = true
    },

    unsetTokenExpired(state) {
      state.isTokenExpired = false
    }
  }
}

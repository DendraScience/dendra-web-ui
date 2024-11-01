export default feathersClient => {
  return {
    storageKey() {
      return feathersClient.passport.options.storageKey
    }
  }
}

export default () => {
  return {
    clearRefreshId(state) {
      state.refreshId = 0
    },

    setRefreshId(state, value) {
      state.refreshId = value
    }
  }
}

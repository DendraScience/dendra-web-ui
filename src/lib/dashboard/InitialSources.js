export default {
  systemTime: {
    clear (model) {
      model.$store.commit('systemTime/clearCurrent')
    },

    guard (model) {
      return !model.$store.getters['systemTime/current']
    },

    execute (model) {
      return model.$store.dispatch('systemTime/get', 'utc')
    },

    assign (model, res) {
      model.$store.commit('systemTime/setCurrent', res)
    }
  }
}

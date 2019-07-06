export const strict = false

export const state = () => ({
  drawer: undefined,
  editing: false
})

export const actions = {}

export const getters = {}

export const mutations = {
  setDrawer(state, value) {
    state.drawer = value
  },
  toggleDrawer(state) {
    state.drawer = !state.drawer
  },

  setEditing(state, value) {
    state.editing = value
  }
}

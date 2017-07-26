export const state = () => ({
  current: null
})

export const getters = {
  current (state) {
    return state.current
  },

  hasCurrent (state) {
    return !!state.current
  },

  name (state, getters) {
    return getters.hasCurrent ? state.current.name : null
  },

  slug (state, getters) {
    // TODO: Change to use real slug, not _id
    return getters.hasCurrent ? state.current._id : null
  },

  tint (state, getters) {
    return (getters.hasCurrent ? state.current.tint : null) || 'blue'
  }
}

export const actions = {
  clearCurrent ({commit}) {
    commit('dashboard/clearCurrent', null, {root: true})
    commit('clearDashboards', null, {root: true})
    commit('clearCurrent')
  },

  setCurrent ({commit}, current) {
    commit('dashboard/clearCurrent', null, {root: true})
    commit('clearDashboards', null, {root: true})
    commit('setCurrent', current)
  }
}

export const mutations = {
  clearCurrent (state) {
    state.current = null
  },

  setCurrent (state, current) {
    state.current = current
  }
}

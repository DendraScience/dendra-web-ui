import Vue from 'vue'

export const strict = process.env.NODE_ENV !== 'production'

export const state = () => ({
  quantitiesById: {}
})

export const actions = {
  // TODO: Remove this?
  // async updateQuantity({ commit, state }, args = {}) {
  //   const ids = args.ids || Object.keys(state.quantitiesById)
  //   for (let i = 0; i < ids.length; i++) {
  //     commit('setQuantity', { id: ids[i], value: args.value })
  //     if (!(i % 10)) await new Promise(resolve => setTimeout(resolve, 0))
  //   }
  // }
}

export const getters = {
  count(state) {
    return Object.keys(state.quantitiesById).length
  },

  getQuantity(state) {
    return id => {
      return state.quantitiesById[id]
    }
  },

  ids(state) {
    return Object.keys(state.quantitiesById)
  }
}

export const mutations = {
  reset(state) {
    state.quantitiesById = {}
  },

  incrementQuantity(state, { id, max }) {
    const value = state.quantitiesById[id]

    if (!value) {
      if (max > 0) Vue.set(state.quantitiesById, id, 1)
    } else if (value < max) {
      Vue.set(state.quantitiesById, id, value + 1)
    } else {
      Vue.delete(state.quantitiesById, id)
    }
  },

  setQuantity(state, { id, value }) {
    if (value) Vue.set(state.quantitiesById, id, value)
    else Vue.delete(state.quantitiesById, id)
  }
}

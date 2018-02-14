import feathersVuex from 'feathers-vuex'
import feathersClient from '@/lib/feathersClient'

const {service, auth} = feathersVuex(feathersClient, {
  idField: '_id'
})

export const plugins = [
  service('dashboards'),
  service('organizations'),
  service('/system/time', {
    namespace: 'systemTime',
    enableEvents: false
  }),

  auth()
]

export const state = () => ({
  isMenuOpen: false
})

export const getters = {
  isMenuOpen (state) {
    return state.isMenuOpen
  }
}

export const mutations = {
  setIsMenuOpen (state, flag) {
    state.isMenuOpen = flag
  },

  toggleMenu (state) {
    state.isMenuOpen = !state.isMenuOpen
  }
}

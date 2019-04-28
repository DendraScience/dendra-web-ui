import Vue from 'vue'
import feathersClient from '@/lib/feathers-client'
import feathersVuex from 'feathers-vuex'
import helpersVuex from '@/lib/helpers-vuex'

const { service, auth, FeathersVuex } = feathersVuex(feathersClient, {
  idField: '_id',
  replaceItems: true
})
const { passport } = helpersVuex(feathersClient)

Vue.use(FeathersVuex)

export const plugins = [
  service('ability'),
  service('organizations'),
  service('persons'),
  service('places'),
  service('schemes'),
  service('soms'),
  service('system/schemas'),
  service('system/time'),
  service('system/timezones'),
  service('uoms'),
  service('users'),
  service('vocabularies'),

  auth({ userService: 'users' }),

  passport()
]

export const strict = true

export const state = () => ({
  abilityUpdated: 0,

  orgId: null,
  stationId: null,
  datastreamId: null
})

export const getters = {
  abilityUpdated(state) {
    return state.abilityUpdated
  },

  org(state, { 'organizations/get': get }) {
    return state.orgId && get(state.orgId)
  },
  orgId(state) {
    return state.orgId
  },
  orgName(state, { org }) {
    return org && org.name
  },
  orgSlug(state, { org }) {
    return org && org.slug
  },

  station(state, { 'stations/get': get }) {
    return state.stationId && get(state.stationId)
  },
  stationId(state) {
    return state.stationId
  },

  datastream(state, { 'datastreams/get': get }) {
    return state.datastreamId && get(state.datastreamId)
  },
  datastreamId(state) {
    return state.datastreamId
  }
}

export const mutations = {
  clearOrg(state) {
    state.orgId = null
  },
  clearstation(state) {
    state.stationId = null
  },
  clearDatastream(state) {
    state.datastreamId = null
  },

  setAbilityUpdated(state, value) {
    state.abilityUpdated = value
  },

  setOrg(state, value) {
    state.orgId = value && value._id
  },
  setStation(state, value) {
    state.stationId = value && value._id
  },
  setDatastream(state, value) {
    state.datastreamId = value && value._id
  }
}

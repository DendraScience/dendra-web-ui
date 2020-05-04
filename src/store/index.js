import Vue from 'vue'
import feathersVuex from 'feathers-vuex'
import feathersClient from '@/lib/feathers-client'
import helpersVuex from '@/lib/helpers-vuex'

const { service, auth, FeathersVuex } = feathersVuex(feathersClient, {
  idField: '_id',
  replaceItems: true,
  whitelist: ['$in', '$and']
})
const { passport, session } = helpersVuex(feathersClient)

Vue.use(FeathersVuex)

export const plugins = [
  service('ability'),
  service('annotations', {
    paginate: true
  }),
  service('datastreams', {
    paginate: true
  }),
  service('memberships'),
  service('organizations'),
  service('persons'),
  service('places'),
  service('schemes'),
  service('soms'),
  service('stations', {
    paginate: true
  }),
  service('system/schemas'),
  service('system/time'),
  service('system/timezones'),
  service('uoms'),
  service('users'),
  service('vocabularies'),

  auth({ userService: 'users' }),

  passport(),
  session()
]

export const strict = process.env.NODE_ENV !== 'production'

export const state = () => ({
  abilityUpdateTime: 0,

  orgId: null,
  stationId: null,
  datastreamId: null,
  annotationId: null
})

export const actions = {
  getSystemTimeUTC({ dispatch }) {
    return dispatch('time/get', 'utc')
  }
}

export const getters = {
  abilityUpdateTime(state) {
    return state.abilityUpdateTime
  },
  isAbilityUpdated(state) {
    return state.abilityUpdateTime > 0
  },

  getUnitText(state, { 'vocabularies/get': get }) {
    const vocabulary = get('dt-unit')

    return unit => {
      const term =
        vocabulary && vocabulary.terms
          ? vocabulary.terms.find(term => term.label === unit)
          : null
      return term && term.abbreviation ? term.abbreviation : unit
    }
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
  },

  annotation(state, { 'annotations/get': get }) {
    return state.annotationId && get(state.annotationId)
  },
  annotationId(state) {
    return state.annotationId
  }
}

export const mutations = {
  clearOrg(state) {
    state.orgId = null
  },
  clearStation(state) {
    state.stationId = null
  },
  clearDatastream(state) {
    state.datastreamId = null
  },
  clearAnnotation(state) {
    state.annotationId = null
  },

  setAbilityUpdateTime(state, value) {
    state.abilityUpdateTime = value
  },

  setOrg(state, value) {
    state.orgId = value && value._id
  },
  setStation(state, value) {
    state.stationId = value && value._id
  },
  setDatastream(state, value) {
    state.datastreamId = value && value._id
  },
  setAnnotation(state, value) {
    state.annotationId = value && value._id
  }
}

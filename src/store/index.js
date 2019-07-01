import Vue from 'vue'
import feathersClient from '@/lib/feathers-client'
import feathersVuex from 'feathers-vuex'
import helpersVuex from '@/lib/helpers-vuex'
import math from '@/lib/math'
import moment from 'moment'

import { TYPE_KEY } from '@/lib/ability'

const { service, auth, FeathersVuex } = feathersVuex(feathersClient, {
  idField: '_id',
  replaceItems: true,
  whitelist: ['$in', '$and']
})
const { passport } = helpersVuex(feathersClient)

Vue.use(FeathersVuex)

export const plugins = [
  service('ability'),
  service('annotations', {
    instanceDefaults(data, { commit, store, Model, Models }) {
      return {
        get quantitySelected() {
          return store.state.cart.quantitiesById[data._id]
        },

        [TYPE_KEY]: 'annotations'
      }
    },

    paginate: true
  }),
  service('datastreams', {
    instanceDefaults(data, { commit, store, Model, Models }) {
      return {
        get quantitySelected() {
          return store.state.cart.quantitiesById[data._id]
        },

        // HACK: Do this right, see: https://feathers-vuex.feathers-plus.com/common-patterns.html#relationships-for-populated-data
        get station() {
          return store.getters['stations/get'](data.station_id)
        },

        [TYPE_KEY]: 'datastreams'
      }
    },

    paginate: true
  }),
  service('organizations'),
  service('persons'),
  service('places'),
  service('schemes'),
  service('soms'),
  service('stations', {
    instanceDefaults(data, { store, Model, Models }) {
      return {
        get time() {
          try {
            const utc = store.getters['time/get']('utc')
            return moment(utc.now).valueOf() + (data.utc_offset | 0) * 1000
          } catch (err) {
            return null
          }
        },

        get utcOffsetHours() {
          return math.round(
            math.unit(data.utc_offset | 0, 's').toNumber('h'),
            2
          )
        }
      }
    },

    paginate: true
  }),
  service('system/schemas'),
  service('system/time'),
  service('system/timezones'),
  service('uoms'),
  service('users'),
  service('vocabularies'),

  auth({ userService: 'users' }),

  passport()
]

export const strict = process.env.NODE_ENV !== 'production'

export const state = () => ({
  abilityUpdateTime: 0,

  orgId: null,
  stationId: null,
  datastreamId: null
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

  getUnitAbbr(state, { 'vocabularies/get': get }) {
    return (label, id = 'dt-unit') => {
      const vocabulary = get(id)
      const term = vocabulary.terms.find(term => term.label === label)

      return term && term.abbreviation
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
  }
}

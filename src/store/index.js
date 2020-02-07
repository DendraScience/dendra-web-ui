import Vue from 'vue'
import moment from 'moment'
import feathersVuex from 'feathers-vuex'
import feathersClient from '@/lib/feathers-client'
import helpersVuex from '@/lib/helpers-vuex'
import math from '@/lib/math'

import { TYPE_KEY } from '@/lib/ability'

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
    instanceDefaults(data, { store, Models }) {
      return {
        get quantitySelected() {
          return store.state.cart.quantitiesById[this._id]
        },

        [TYPE_KEY]: 'annotations'
      }
    },

    paginate: true
  }),
  service('datastreams', {
    instanceDefaults(data, { store }) {
      return {
        get dtUnit() {
          return (this.terms && this.terms.dt && this.terms.dt.Unit) || ''
        },

        get nameWithStation() {
          return this.station_lookup
            ? `${this.station_lookup.name} ${this.name}`
            : this.name
        },

        get nameWithStationAndUnit() {
          return `${this.nameWithStation} ${this.dtUnit}`
        },

        get quantitySelected() {
          return store.state.cart.quantitiesById[this._id]
        },

        get station() {
          return store.getters['stations/get'](this.station_id) || {}
        },

        [TYPE_KEY]: 'datastreams'
      }
    },

    paginate: true
  }),
  service('memberships'),
  service('organizations', {
    instanceDefaults(data, { store }) {
      return {
        [TYPE_KEY]: 'organizations'
      }
    }
  }),
  service('persons'),
  service('places'),
  service('schemes'),
  service('soms'),
  service('stations', {
    instanceDefaults(data, { store }) {
      return {
        get nameWithEnabled() {
          return this.is_enabled ? this.name : `${this.name} (disabled)`
        },

        get quantitySelected() {
          return store.state.cart.quantitiesById[this._id]
        },

        get time() {
          try {
            return (
              moment.utc(store.getters['time/get']('utc').now).valueOf() +
              (this.utc_offset | 0) * 1000
            )
          } catch (err) {
            return null
          }
        },

        get utcOffsetHours() {
          return math.round(
            math.unit(this.utc_offset | 0, 's').toNumber('h'),
            2
          )
        },

        [TYPE_KEY]: 'stations'
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

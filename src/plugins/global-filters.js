import Vue from 'vue'
import math from '@/lib/math'
import moment from 'moment'
import _get from 'lodash/get'
import _truncate from 'lodash/truncate'

Vue.filter('get', (...args) => {
  return _get(...args)
})

Vue.filter('truncate', (...args) => {
  return _truncate(...args)
})

Vue.filter('math', (value, defaultValue = '', ...calls) => {
  if (value === undefined) return defaultValue

  return calls.reduce((m, args) => {
    return m[args.shift()](...args)
  }, math.chain(value))
})

Vue.filter('moment', (value, defaultValue = '', ...calls) => {
  if (value === undefined) return defaultValue

  return calls.reduce((m, args) => {
    return m[args.shift()](...args)
  }, moment(value))
})

Vue.filter('pluralize', (value, singular, plural) => {
  return value === 1 ? singular : plural || `${singular}s`
})

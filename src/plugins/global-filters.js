import Vue from 'vue'
import math from '@/lib/math'
import moment from 'moment'
import _get from 'lodash/get'

Vue.filter('get', (...args) => {
  return _get(...args)
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

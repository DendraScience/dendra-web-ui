import Vue from 'vue'
import moment from 'moment'
import _get from 'lodash/get'
import _truncate from 'lodash/truncate'
import {
  dateFormat,
  dateTimeFormat,
  timeFormat,
  utcOffsetHours
} from '@/lib/date'
import math from '@/lib/math'

Vue.filter('dateFormat', (value, defaultValue = '', key = 'y4md') => {
  return value === undefined || value === null
    ? defaultValue
    : dateFormat(value, key)
})

Vue.filter('dateTimeFormat', (value, defaultValue = '', key = 'y4md_hm24') => {
  return value === undefined || value === null
    ? defaultValue
    : dateTimeFormat(value, key)
})

Vue.filter('get', (...args) => {
  return _get(...args)
})

Vue.filter('https', value => {
  return typeof value === 'string' ? value.replace('http:', 'https:') : null
})

Vue.filter('math', (value, defaultValue = '', ...calls) => {
  return value === undefined || value === null
    ? defaultValue
    : calls.reduce((m, args) => {
        return m[args.shift()](...args)
      }, math.chain(value))
})

Vue.filter('moment', (value, defaultValue = '', ...calls) => {
  return value === undefined || value === null
    ? defaultValue
    : calls.reduce((m, args) => {
        return m[args.shift()](...args)
      }, moment(value))
})

Vue.filter('pluralize', (value, singular, plural) => {
  return value === 1 ? singular : plural || `${singular}s`
})

Vue.filter('round', (value, defaultValue = '', n = 0) => {
  return value === undefined || value === null
    ? defaultValue
    : math.round(value, n)
})

Vue.filter('timeFormat', (value, defaultValue = '', key = 'hm24') => {
  return value === undefined || value === null
    ? defaultValue
    : timeFormat(value, key)
})

Vue.filter('truncate', (...args) => {
  return _truncate(...args)
})

Vue.filter('unit', (value, defaultValue = '', name, toName) => {
  return value === undefined || value === null
    ? defaultValue
    : math.unit(value, name).toNumber(toName)
})

Vue.filter('utcOffsetHours', (value, defaultValue = '') => {
  return value === undefined || value === null
    ? defaultValue
    : utcOffsetHours(value)
})

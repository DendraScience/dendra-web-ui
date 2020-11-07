import Vue from 'vue'
// TODO: Deprecate
// import moment from 'moment'
import _get from 'lodash/get'
import _truncate from 'lodash/truncate'
import {
  dateFormat,
  dateFormatLocal,
  dateTimeFormat,
  dateTimeFormatExtra,
  dateTimeFormatLocal,
  timeFormat,
  timeFormatLocal,
  timeFromNow,
  utcOffsetHours
} from '@/lib/date'
import math from '@/lib/math'
import { companyName, thingTypeName } from '@/lib/moniker'

Vue.filter('companyName', value => {
  return companyName(value)
})

Vue.filter('counted', (value, singular, plural) => {
  return value === undefined || value === null
    ? ''
    : value.toLocaleString() +
        ' ' +
        (value === 1 ? singular : plural || `${singular}s`)
})

Vue.filter('dateFormat', (value, defaultValue = '', ...args) => {
  return value === undefined || value === null
    ? defaultValue
    : dateFormat(value, ...args)
})

Vue.filter('dateFormatLocal', (value, defaultValue = '', ...args) => {
  return value === undefined || value === null
    ? defaultValue
    : dateFormatLocal(value, ...args)
})

Vue.filter('dateTimeFormat', (value, defaultValue = '', ...args) => {
  return value === undefined || value === null
    ? defaultValue
    : dateTimeFormat(value, ...args)
})

Vue.filter('dateTimeFormatExtra', (value, defaultValue = '', ...args) => {
  return value === undefined || value === null
    ? defaultValue
    : dateTimeFormatExtra(value, ...args)
})

Vue.filter('dateTimeFormatLocal', (value, defaultValue = '', ...args) => {
  return value === undefined || value === null
    ? defaultValue
    : dateTimeFormatLocal(value, ...args)
})

Vue.filter('get', (...args) => {
  return _get(...args)
})

Vue.filter('https', value => {
  return typeof value === 'string' ? value.replace('http:', 'https:') : null
})

// TODO: Deprecate
// Vue.filter('math', (value, defaultValue = '', ...calls) => {
//   return value === undefined || value === null
//     ? defaultValue
//     : calls.reduce((m, args) => {
//         return m[args.shift()](...args)
//       }, math.chain(value))
// })

// TODO: Deprecate
// Vue.filter('moment', (value, defaultValue = '', ...calls) => {
//   return value === undefined || value === null
//     ? defaultValue
//     : calls.reduce((m, args) => {
//         return m[args.shift()](...args)
//       }, moment(value))
// })

Vue.filter('pluralize', (value, singular, plural) => {
  return value === 1 ? singular : plural || `${singular}s`
})

Vue.filter('round', (value, defaultValue = '', n = 0) => {
  return value === undefined || value === null
    ? defaultValue
    : math.round(value, n)
})

Vue.filter('thingTypeName', value => {
  return thingTypeName(value)
})

Vue.filter('timeFormat', (value, defaultValue = '', ...args) => {
  return value === undefined || value === null
    ? defaultValue
    : timeFormat(value, ...args)
})

Vue.filter('timeFormatLocal', (value, defaultValue = '', ...args) => {
  return value === undefined || value === null
    ? defaultValue
    : timeFormatLocal(value, ...args)
})

Vue.filter('timeFromNow', (value, defaultValue = '', ...args) => {
  return value === undefined || value === null
    ? defaultValue
    : timeFromNow(value, ...args)
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

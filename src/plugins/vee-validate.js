import { extend } from 'vee-validate'
import {
  alpha_num as alphaNum,
  between,
  confirmed,
  email,
  max,
  min,
  regex,
  required
} from 'vee-validate/dist/rules'
import moment from 'moment'
import { dateFormats, timeFormats } from '@/lib/date'
import isURL from 'validator/es/lib/isURL'

extend('alpha_num', alphaNum)
extend('between', between)
extend('confirmed', confirmed)
extend('date_format', {
  message(field, { key }) {
    return `${field} must be in the format ${dateFormats[key]}.`
  },
  params: ['key'],
  validate(value, { key }) {
    return moment(value, dateFormats[key], true).isValid()
  }
})
extend('email', email)
extend('resolved_valid', {
  params: ['resolved'],
  validate(value, { resolved }) {
    return resolved.valid
  }
})
extend('max', max)
extend('min', min)
extend('regex', regex)
extend('required', required)
extend('time_format', {
  message(field, { key }) {
    return `${field} must be in the format ${timeFormats[key]}.`
  },
  params: ['key'],
  validate(value, { key }) {
    return moment(value, timeFormats[key], true).isValid()
  }
})
extend('url', {
  params: ['options'],
  validate(value, { options }) {
    return isURL(value, options)
  }
})

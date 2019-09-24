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

extend('alpha_num', alphaNum)
extend('between', between)
extend('confirmed', confirmed)
extend('email', email)
extend('max', max)
extend('min', min)
extend('moment_format', {
  getMessage(field, params) {
    return `The ${field} must be in the format ${params[0]}.`
  },

  validate(value, params) {
    return moment(value, params[0], true).isValid()
  }
})
extend('regex', regex)
extend('required', required)

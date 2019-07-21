import Vue from 'vue'
import VeeValidate from 'vee-validate'
import moment from 'moment'

const dictionary = {
  en: {
    attributes: {
      current_password: 'current password',
      email: 'email',
      flag: 'flag',
      new_password: 'new password',
      new_password_confirm: 'new password',
      password: 'password',

      chartTitle: 'chart title',
      fromDate: 'from date',
      fromTime: 'from time',
      toDate: 'to date',
      toTime: 'to time'
    }
  }
}

Vue.use(VeeValidate, {
  dictionary,
  inject: false,
  locale: 'en'
})

VeeValidate.Validator.extend('moment_format', {
  getMessage(field, params) {
    return `The ${field} must be in the format ${params[0]}.`
  },

  validate(value, params) {
    return moment(value, params[0], true).isValid()
  }
})

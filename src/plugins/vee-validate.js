import Vue from 'vue'
import VeeValidate from 'vee-validate'

const dictionary = {
  en: {
    attributes: {
      current_password: 'current password',
      email: 'email',
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

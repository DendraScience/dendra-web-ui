import Vue from 'vue'
import VeeValidate from 'vee-validate'

const dictionary = {
  en: {
    attributes: {
      email: 'Email',
      password: 'Password'
    }
  }
}

Vue.use(VeeValidate, {
  locale: 'en',
  dictionary
})

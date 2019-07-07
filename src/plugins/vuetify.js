import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  theme: {
    primary: colors.blue,
    secondary: colors.green,
    tertiary: colors.blue.lighten2,
    accent: colors.blueGrey.darken2,
    info: colors.blue.darken2,
    warning: colors.amber.darken3,
    error: colors.deepOrange.darken3,
    success: colors.green.darken1
  }
})

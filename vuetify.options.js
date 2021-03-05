import colors from 'vuetify/es5/util/colors'

export default {
  icons: {
    iconfont: 'mdiSvg'
  },

  theme: {
    themes: {
      dark: {
        primary: colors.blue,
        secondary: colors.green,
        tertiary: colors.blue.lighten2,
        accent: colors.blueGrey.darken2,
        info: colors.blue.darken2,
        warning: colors.amber.darken3,
        error: colors.deepOrange.darken3,
        success: colors.green.darken1
      },

      light: {
        primary: colors.blue,
        secondary: colors.green,
        tertiary: colors.blue.lighten2,
        accent: colors.blueGrey.darken2,
        info: colors.blue.darken2,
        warning: colors.amber.darken3,
        error: colors.deepOrange.darken3,
        success: colors.green.darken1
      }
    }
  }
}

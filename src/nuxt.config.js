const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  /**
   * Build configuration
   */
  build: {
    transpile: ['vuetify/lib'],
    plugins: [new VuetifyLoaderPlugin()],
    loaders: {
      stylus: {
        import: ['~assets/style/variables.styl']
      }
    },

    /**
     * You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }

      if (ctx.isClient) {
        config.module.rules.push({
          test: /\.worker\.js$/, // this will pick up all .js files that ends with ".worker.js"
          loader: 'worker-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },

  /**
   * Global CSS
   */
  css: ['~/assets/style/app.styl'],

  env: {
    apiPath: process.env.API_PATH || '/socket.io',
    apiUri: process.env.API_URI || 'http://localhost:3030',

    googleMapsAPIKey: 'AIzaSyC8zfohXmxg5VzAg9G2rCypfKmU-KpOv6k'
  },

  /**
   * Headers of the page
   */
  head: {
    title: 'Dendra',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'Dendra is a cyberinfrastructure project for real-time sensor data storage, retrieval, management, and curation.'
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      }
    ]
  },

  /**
   * Customize the progress-bar color
   */
  loading: { color: '#fff' },

  mode: 'spa',

  /**
   * Nuxt.js modules
   */
  modules: ['@nuxtjs/pwa'],

  /**
   * Plugins to load before mounting the App
   */
  plugins: [
    { src: '~/plugins/logger', ssr: false },
    { src: '~/plugins/vuetify', ssr: false },
    { src: '~/plugins/vee-validate', ssr: false },
    { src: '~/plugins/ability', ssr: false },
    { src: '~/plugins/global-filters', ssr: false },
    { src: '~/plugins/global-mixin', ssr: false }
  ],

  router: {
    middleware: ['auth', 'ability']
  },

  srcDir: 'src'
}

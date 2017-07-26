module.exports = {
  build: {
    babel: {
      plugins: ['transform-runtime']
    },

    // Run eslint on save
    extend (config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },

  css: [
    { src: '~assets/css/global.scss', lang: 'scss' }
  ],

  head: {
    title: 'Dendra',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Dendra.Science Home' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },

      // CSS and fonts
      { rel: 'stylesheet', href: '/dendra-bootstrap/dist/css/bootstrap.css' }
    ],
    script: [
      {
        src: 'https://code.jquery.com/jquery-3.2.1.min.js',
        integrity: 'sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=',
        crossorigin: 'anonymous',
        type: 'text/javascript'
      },
      { src: 'https://use.fontawesome.com/a6ba001ef0.js', type: 'text/javascript' },
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js', type: 'text/javascript' },
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.5.0/velocity.min.js', type: 'text/javascript' },
      { src: '/dendra-bootstrap/dist/js/bootstrap.js', type: 'text/javascript' }
    ]
  },

  loading: { color: '#3B8070' },

  plugins: [
    { src: '~plugins/logger.js' },
    { src: '~plugins/dataloader.js', ssr: false },
    { src: '~plugins/services.js' }
  ],

  router: {
    linkActiveClass: 'active'
  }
}

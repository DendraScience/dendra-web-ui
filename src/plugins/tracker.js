// NOTE: Using inject now (see below)
// import Vue from 'vue'

// Vue.mixin({
//   computed: {
//     $tracker() {
//       return this.$root.$options.$tracker
//     }
//   }
// })

const googleTrackingId = process.env.googleTrackingId
const woopraProjectKey = process.env.woopraProjectKey

const { gtag, gtm, woopra } = global

const tracker = {
  event(event, props) {
    if (woopra && woopraProjectKey) woopra.track(event, props)

    if (!googleTrackingId) {
    } else if (gtag) {
      gtag('event', event, props)
    } else if (gtm) {
      gtm(Object.assign({ event }, props))
    }
  },

  identify(props) {
    if (woopra && woopraProjectKey) woopra.identify(props)
  },

  pageView({ name, path }) {
    if (woopra && woopraProjectKey)
      woopra.track('pv', { title: name, url: path })

    if (!googleTrackingId) {
    } else if (gtag) {
      // SEE: https://developers.google.com/analytics/devguides/collection/gtagjs/pages
      gtag('js', new Date())
      gtag('config', process.env.googleTrackingId, {
        page_title: name,
        page_path: path
      })
    } else if (gtm) {
      gtm({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
      gtm({
        event: 'pageView',
        pageName: name,
        pagePath: path
      })
    }
  }
}

export default ({ app }, inject) => {
  if (woopra && woopraProjectKey) {
    woopra.config({
      domain: woopraProjectKey,
      outgoing_tracking: true
    })
  }

  inject('tracker', tracker)

  app.router.afterEach((to, from) => {
    // Follow SPA best practices -- virtual pageviews
    // SEE: https://developers.google.com/analytics/devguides/collection/gtagjs/single-page-applications
    if (to.query.faceted) {
      tracker.pageView(Object.assign({}, to, { path: `${to.path}/faceted` }))
    } else {
      tracker.pageView(to)
    }
  })
}

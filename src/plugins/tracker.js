import logger from '@dendra-science/console-logger'
import { Tracker } from '@/lib/tracker'

const { gtag, gtm } = global
const googleTrackingId =
  window.__env.googleTrackingId || process.env.googleTrackingId
const plausableDomain =
  window.__env.plausableDomain || process.env.plausableDomain
const plausableEnabled =
  (window.__env.plausableEnabled || process.env.plausableEnabled) === 'true'
const webSiteURL = window.__env.webSiteURL || process.env.webSiteURL

export default ({ app, store }, inject) => {
  const tracker = new Tracker({
    googleTrackingId,
    gtag,
    gtm,
    logger,
    plausableDomain,
    plausableEnabled,
    store,
    webSiteURL
  })

  inject('tracker', tracker)

  app.router.beforeEach((to, from, next) => {
    // Follow SPA best practices -- virtual pageviews
    // SEE: https://developers.google.com/analytics/devguides/collection/gtagjs/single-page-applications
    if (!to.path.startsWith('/widgets/')) {
      if (to.query.faceted) {
        tracker.pageView(Object.assign({}, to, { path: `${to.path}/faceted` }))
      } else {
        tracker.pageView(to)
      }
    }
    next()
  })
}

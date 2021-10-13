import logger from '@dendra-science/console-logger'
import { Tracker } from '@/lib/tracker'

const domain = process.env.domain
const hostname = process.env.hostname
const googleTrackingId = process.env.googleTrackingId
const plausableEnabled = process.env.plausableEnabled
const { gtag, gtm } = global

export default ({ app, store }, inject) => {
  const tracker = new Tracker({
    domain,
    googleTrackingId,
    gtag,
    gtm,
    hostname,
    logger,
    plausableEnabled,
    store
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

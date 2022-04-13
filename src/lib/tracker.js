import Plausible from 'plausible-tracker'

function getUser(store) {
  const user =
    store &&
    store.state &&
    store.state.auth &&
    store.state.auth.user &&
    store.state.auth.user._id
  return user || 'guest'
}

export class Tracker {
  constructor(options) {
    const { trackEvent, trackPageview } = Plausible({
      domain: options.plausableDomain,
      trackLocalhost: true
    })

    Object.assign(this, { trackEvent, trackPageview }, options)
  }

  event(event, props) {
    const {
      googleTrackingId,
      gtag,
      gtm,
      logger,
      plausableEnabled,
      store,
      trackEvent
    } = this
    const user = getUser(store)
    const newProps = Object.assign({}, props, { user })

    if (!(googleTrackingId || plausableEnabled))
      logger.info('tracker "%s" %o', event, newProps)

    if (plausableEnabled) {
      trackEvent(event, { props: newProps })
      logger.info('plausable "%s" %o', event, newProps)
    }

    if (googleTrackingId) {
      if (gtag) {
        gtag('event', event, newProps)
        logger.info('gtag "%s" %o', event, newProps)
      } else if (gtm) {
        gtm(Object.assign({ event }, newProps))
        logger.info('gtm "%s" %o', event, newProps)
      }
    }
  }

  pageView({ name, path }) {
    const normalizedPath = path.replace(/\/$/, '')
    const {
      googleTrackingId,
      gtag,
      gtm,
      logger,
      plausableEnabled,
      store,
      trackPageview,
      webSiteURL
    } = this
    const user = getUser(store)

    if (!(googleTrackingId || plausableEnabled))
      logger.info('tracker "%s" %o', 'pageView', { name, path: normalizedPath })

    if (plausableEnabled) {
      const props = {
        url: new URL(normalizedPath, webSiteURL).toString(),
        user
      }
      trackPageview(props)
      logger.info('plausable "%s" %o', 'pageview', props)
    }

    if (googleTrackingId) {
      if (gtag) {
        const event = 'pageView'
        const props = {
          page_title: name,
          page_path: normalizedPath,
          user
        }
        gtag('config', googleTrackingId, props)
        logger.info('gtag "%s" %o', event, props)
      } else if (gtm) {
        const event = 'pageView'
        const props = {
          pageName: name,
          pagePath: normalizedPath,
          user
        }
        gtm(Object.assign({ event }, props))
        logger.info('gtm "%s" %o', event, props)
      }
    }
  }
}

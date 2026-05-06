import Plausible from 'plausible-tracker'
import Posthog from 'posthog-js'

const MANAGED_USER_DOMAIN = '@managed-user.dendra.science'

function getSubject(store) {
  const email =
    store &&
    store.state &&
    store.state.auth &&
    store.state.auth.user &&
    store.state.auth.user.email

  if (typeof email === 'string' && email.endsWith(MANAGED_USER_DOMAIN)) {
    return email.replace(MANAGED_USER_DOMAIN, '')
  }
  return 'anonymous'
}

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
    if (options.posthogAPIHost && options.posthogKey) {
      Posthog.init(options.posthogKey, {
        api_host: options.posthogAPIHost,
        defaults: '2026-01-30',
        person_profiles: 'identified_only',
        persistence: 'localStorage+cookie'
      })
    }

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
    const subject = getSubject(store)
    const user = getUser(store)
    const newProps = Object.assign({}, props, { user })
    const subProps = Object.assign({}, props, { subject, user })

    if (!(googleTrackingId || plausableEnabled))
      logger.info('tracker "%s" %o', event, newProps)

    if (plausableEnabled) {
      trackEvent(event, { props: subProps })
      logger.info('plausable "%s" %o', event, subProps)
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
      posthogAPIHost,
      posthogKey,
      store,
      trackPageview,
      webSiteURL
    } = this
    const subject = getSubject(store)
    const user = getUser(store)

    if (!(googleTrackingId || plausableEnabled))
      logger.info('tracker "%s" %o', 'pageView', { name, path: normalizedPath })

    if (plausableEnabled) {
      const props = {
        subject,
        user
      }
      trackPageview(
        { url: new URL(normalizedPath, webSiteURL).toString() },
        { props }
      )
      logger.info('plausable "%s" %o', 'pageview', props)
    }

    if (posthogAPIHost && posthogKey && subject !== 'anonymous') {
      Posthog.identify(subject)
      logger.info('posthog identify "%s"', subject)
    } else {
      Posthog.reset()
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

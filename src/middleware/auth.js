// import auth from '@feathersjs/authentication-client'

export default async function ({ app, query, store }) {
  const { auth } = store.state
  const { login, logout } = query

  // Check for params to sync auth w/ other browsing contexts
  if (login === null && logout === undefined) {
    store.dispatch('session/broadcastLogin')
    const url = new URL(window.location.href)
    url.searchParams.delete('login')
    window.history.replaceState({}, '', url.href)
  } else if (login === undefined && logout === null) {
    store.dispatch('session/broadcastLogout')
    const url = new URL(window.location.href)
    url.searchParams.delete('logout')
    window.history.replaceState({}, '', url.href)
  }

  // Already authenticated?
  if (auth.accessToken) return

  //
  // Try Canopy auth with cookie session to obtain native JWT
  //

  store.commit('session/setLocal', false)

  try {
    await store.dispatch('canopy/authenticate')
  } catch (err) {
    app.$logger.error('middleware/canopy', err)
  }

  if (auth.accessToken) {
    // Discard native JWT after successful Canopy auth
    window.localStorage.removeItem(store.getters['passport/storageKey'])
    return
  }

  //
  // Try native auth with JWT in local storage
  //

  store.commit('session/setLocal', true)

  // Explicitly check for an existing JWT
  // auth/authenticate can do it but throws an error
  const jwt = await store.dispatch('passport/getJWT')
  if (jwt) {
    try {
      await store.dispatch('auth/authenticate', {
        accessToken: jwt,
        strategy: 'jwt'
      })
    } catch (err) {
      app.$logger.error('middleware/auth', err)
    }
  }
}

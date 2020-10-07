export default async function ({ app, redirect, store }) {
  const { auth } = store.state
  const { accessToken } = auth

  const jwt = await store.dispatch('passport/getJWT')

  if (!jwt || jwt === accessToken) return

  try {
    await store.dispatch('auth/authenticate', {
      accessToken: jwt,
      strategy: 'jwt'
    })
  } catch (err) {
    app.$logger.error('middleware/auth', err)

    // FIX: Bad token causes infinie loop?
    // return redirect('/')
  }
}

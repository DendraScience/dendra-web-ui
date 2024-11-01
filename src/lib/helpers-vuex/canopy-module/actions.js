export default (_, api) => {
  return {
    async authenticate({ dispatch }) {
      const resp = await fetch(
        `${api.rpc}/dendra.api.auth.v3alpha1.TokenService/AcquireV2TokenWithProvisioning`,
        {
          body: '{}',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          mode: 'cors'
        }
      )

      let jwt

      if (resp.ok) {
        const json = await resp.json()
        jwt = json.token
      }

      if (!jwt) return

      await dispatch(
        'auth/authenticate',
        {
          accessToken: jwt,
          strategy: 'jwt'
        },
        { root: true }
      )
    }
  }
}

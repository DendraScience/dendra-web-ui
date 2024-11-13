import logger from '@dendra-science/console-logger'

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
      } else {
        const json = await resp.json()
        logger.info('AcquireV2TokenWithProvisioning response', json)
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

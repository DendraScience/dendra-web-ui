/**
 * Inject settings from process.env into the client app.
 *
 * Allows us to configure the app in both the server and client post-build.
 */

// Specific environment vars to publish into __PROCESS_ENV__
const ENV_KEYS = [
  'WEB_UI_API_PATH',
  'WEB_UI_API_URI',
  'WEB_UI_CLIENT_API_PATH',
  'WEB_UI_CLIENT_API_URI'
]

const processEnv = ENV_KEYS.reduce((env, key) => {
  const val = process.env[key]
  if (typeof val !== 'undefined') env[key] = val
  return env
}, {})

module.exports = function ProcessEnvModule () {
  if (this.nuxt.hook) {
    this.nuxt.hook('render:resourcesLoaded', resources => {
      if (resources._ssrTemplate) return

      // Wrap the SSR template function
      resources._ssrTemplate = resources.ssrTemplate
      resources.ssrTemplate = function (obj) {
        if (!(obj.APP == null)) obj.APP += `<script type="text/javascript">window.__PROCESS_ENV__=${JSON.stringify(processEnv)};</script>`

        return resources._ssrTemplate(obj)
      }
    })
  }
}

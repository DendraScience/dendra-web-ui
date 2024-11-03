import logger from '@dendra-science/console-logger'
import setupState from './state'
// import setupGetters from './getters'
import setupMutations from './mutations'
import setupActions from './actions'

const defaults = {
  namespace: 'canopy',
  state: {}, // for custom state
  // getters: {}, // for custom getters
  mutations: {}, // for custom mutations
  actions: {} // for custom actions
}

export default (feathersClient, api) => {
  if (!api) {
    throw new Error('You must pass an api instance to canopy module')
  }

  return function createPlugin(options) {
    options = Object.assign({}, defaults, options)

    const defaultState = setupState(options)
    // const defaultGetters = setupGetters(feathersClient, api)
    const defaultMutations = setupMutations(feathersClient, api)
    const defaultActions = setupActions(feathersClient, api)

    return store => {
      const { namespace } = options

      const refreshAuth = () => {
        store.commit('session/setLocal', false)
        store.commit('canopy/clearRefreshId')
        store
          .dispatch('canopy/authenticate')
          .then(() => {
            logger.info('refreshAuth success')
          })
          .catch(err => {
            logger.error('refreshAuth', err)
          })
      }

      store.registerModule(namespace, {
        namespaced: true,
        state: Object.assign({}, defaultState, options.state),
        // getters: Object.assign({}, defaultGetters, options.getters),
        mutations: Object.assign({}, defaultMutations, options.mutations),
        actions: Object.assign({}, defaultActions, options.actions)
      })

      store.subscribe(mutation => {
        if (mutation.type === 'auth/setPayload') {
          if (store.state.canopy.refreshId) {
            clearTimeout(store.state.canopy.refreshId)
            store.commit('canopy/clearRefreshId')
          }
        }
      })

      store.subscribeAction({
        before: action => {
          if (
            action.type === 'auth/logout' ||
            action.type === 'canopy/authenticate'
          ) {
            if (store.state.canopy.refreshId) {
              clearTimeout(store.state.canopy.refreshId)
              store.commit('canopy/clearRefreshId')
            }
          }
        },

        after: action => {
          if (action.type === 'canopy/authenticate') {
            if (
              store.state.auth.payload &&
              typeof store.state.auth.payload.exp === 'number' &&
              typeof store.state.auth.payload.iat === 'number'
            ) {
              const refreshMs =
                (store.state.auth.payload.exp -
                  store.state.auth.payload.iat -
                  60) *
                1000

              store.commit(
                'canopy/setRefreshId',
                setTimeout(refreshAuth, refreshMs)
              )
            }
          }
        }
      })
    }
  }
}

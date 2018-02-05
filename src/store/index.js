import feathersVuex from 'feathers-vuex'
import feathersClient from '@/lib/feathersClient'

const {service, auth} = feathersVuex(feathersClient, {
  idField: '_id'
})

export const plugins = [
  service('dashboards'),
  service('organizations'),
  service('/system/time', {
    namespace: 'systemTime',
    enableEvents: false
  }),

  auth()
]

export const state = () => ({
})

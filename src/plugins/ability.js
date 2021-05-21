import { Ability, createAliasResolver } from '@casl/ability'
import { TYPE_KEY } from '@/lib/ability'

const resolveAction = createAliasResolver({
  delete: 'remove',
  read: ['get', 'find']
})

function detectSubjectType(object) {
  return object[TYPE_KEY]
}

function as(name, obj) {
  return Object.assign(
    {
      [TYPE_KEY]: name
    },
    obj
  )
}

export default ({ store }, inject) => {
  const ability = new Ability([], { detectSubjectType, resolveAction })

  ability.on('update', () => {
    store.commit('setAbilityUpdateTime', Date.now())
  })

  inject('ability', ability)

  inject('can', (...args) =>
    store.getters.isAbilityUpdated ? ability.can(...args) : false
  )
  inject('canAssign', (name, obj, field) =>
    store.getters.isAbilityUpdated
      ? ability.can('assign', as(name, obj), field)
      : false
  )
  inject('canCreate', (name, org, obj) =>
    store.getters.isAbilityUpdated
      ? ability.can(
          'create',
          as(name, org ? Object.assign({ organization_id: org._id }, obj) : {})
        )
      : false
  )
  inject('canDownload', (name, obj) =>
    store.getters.isAbilityUpdated
      ? ability.can('download', as(name, obj))
      : false
  )
  inject('canGraph', (name, obj) =>
    store.getters.isAbilityUpdated ? ability.can('graph', as(name, obj)) : false
  )
  inject('canPatch', (name, obj) =>
    store.getters.isAbilityUpdated ? ability.can('patch', as(name, obj)) : false
  )

  inject('cannot', (...args) =>
    store.getters.isAbilityUpdated ? ability.cannot(...args) : true
  )
  inject('cannotAssign', (name, obj, field) =>
    store.getters.isAbilityUpdated
      ? ability.cannot('assign', as(name, obj), field)
      : true
  )
  inject('cannotDownload', (name, obj) =>
    store.getters.isAbilityUpdated
      ? ability.cannot('download', as(name, obj))
      : true
  )
  inject('cannotGraph', (name, obj) =>
    store.getters.isAbilityUpdated
      ? ability.cannot('graph', as(name, obj))
      : true
  )
}

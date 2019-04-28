import { Ability } from '@casl/ability'

const TYPE_KEY = Symbol.for('type')

Ability.addAlias('read', ['get', 'find'])
Ability.addAlias('delete', 'remove')

function subjectName(subject) {
  if (!subject || typeof subject === 'string') {
    return subject
  }

  return subject[TYPE_KEY]
}

export default ({ store }, inject) => {
  const ability = new Ability([], { subjectName })

  ability.on('update', () => {
    store.commit('setAbilityUpdated', Date.now())
  })

  inject('ability', ability)
}

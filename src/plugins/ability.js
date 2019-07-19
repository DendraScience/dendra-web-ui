import { Ability } from '@casl/ability'
import { TYPE_KEY } from '@/lib/ability'

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
    store.commit('setAbilityUpdateTime', Date.now())
  })

  inject('ability', ability)
  inject('abilityTypeKey', TYPE_KEY)
}

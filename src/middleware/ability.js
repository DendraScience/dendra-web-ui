const CURRENT = 'current'

export default async function({ app, store }) {
  try {
    if (store.getters['ability/get'](CURRENT)) return

    const doc = await store.dispatch('ability/get', CURRENT)
    app.$ability.update(doc.rules)
  } catch (err) {
    app.$logger.error('middleware/ability', err)
  }
}

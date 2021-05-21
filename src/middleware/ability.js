const CURRENT = 'current'

export default async function ({ app, store }) {
  try {
    if (store.getters['ability/get'](CURRENT)) return

    const doc = await store.dispatch('ability/get', CURRENT)
    // HACK: 'actions' deprecated
    // SEE: https://github.com/stalniy/casl/blob/master/packages/casl-ability/CHANGELOG.md
    app.$ability.update(
      doc.rules.map(rule => ({ action: rule.actions, ...rule }))
    )
  } catch (err) {
    app.$logger.error('middleware/ability', err)
  }
}

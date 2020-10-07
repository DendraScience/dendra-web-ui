const ID = 'dt-unit'

export default async function ({ app, store }) {
  try {
    if (store.getters['vocabularies/get'](ID)) return

    await store.dispatch('vocabularies/get', ID)
  } catch (err) {
    app.$logger.error('middleware/dt-unit-vocabulary', err)
  }
}

export default async function({ app, store }) {
  try {
    if (store.getters['soms/find']().data.length) return

    await store.dispatch('soms/find')
  } catch (err) {
    app.$logger.error('middleware/soms', err)
  }
}

export default async function ({ app, store }) {
  try {
    await store.dispatch('getSystemTimeUTC')
  } catch (err) {
    app.$logger.error('middleware/system-time-utc', err)
  }
}

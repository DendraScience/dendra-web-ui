export default async function ({ error, store }) {
  try {
    await store.dispatch('persons/find')
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}
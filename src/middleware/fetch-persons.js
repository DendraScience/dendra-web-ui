export default async function ({ error, store }) {
  try {
    await store.dispatch('persons/find', {
      query: { $sort: { name: 1, _id: 1 } }
    })
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}

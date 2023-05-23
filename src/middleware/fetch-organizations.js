export default async function ({ error, store }) {
  try {
    await store.dispatch('organizations/find', {
      query: { $sort: { full_name: 1, _id: 1 } }
    })
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}

export default async function ({ error, query, store }) {
  const { orgId } = store.getters
  const { datastreamId } = query

  try {
    if (!datastreamId) return

    await store.dispatch('datastreams/find', {
      query: {
        _id: datastreamId,
        organization_id: orgId,
        $limit: 1
      }
    })
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}

export default async function ({ error, query, store }) {
  const { orgId } = store.getters
  const { stationId } = query

  try {
    if (!stationId) return

    await store.dispatch('stations/find', {
      query: {
        _id: stationId,
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

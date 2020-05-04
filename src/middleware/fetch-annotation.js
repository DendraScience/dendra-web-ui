export default async function({ error, query, store }) {
  const { orgId } = store.getters
  const { annotationId } = query

  try {
    if (!annotationId) return

    await store.dispatch('annotations/find', {
      query: {
        _id: annotationId,
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

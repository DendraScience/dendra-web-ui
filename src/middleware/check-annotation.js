export default async function({ error, params, store }) {
  const { orgId } = store.getters
  const { annotationId } = params

  try {
    const res = await store.dispatch('annotations/find', {
      query: {
        _id: annotationId,
        organization_id: orgId,
        $limit: 1
      }
    })

    if (!(res && res.data && res.data.length)) {
      return error({
        statusCode: 404,
        message: 'Annotation not found.'
      })
    }

    store.commit('setAnnotation', res.data[0])
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}

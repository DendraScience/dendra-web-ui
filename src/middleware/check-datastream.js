export default async function ({ error, params, store }) {
  const { orgId } = store.getters
  const { datastreamId } = params

  try {
    const res = await store.dispatch('datastreams/find', {
      query: {
        _id: datastreamId,
        organization_id: orgId,
        $limit: 1
      }
    })

    if (!(res && res.data && res.data.length)) {
      return error({
        statusCode: 404,
        message: 'Datastream not found.'
      })
    }

    store.commit('setDatastream', res.data[0])
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}

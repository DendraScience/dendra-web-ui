export default async function ({ error, params, query: q, store }) {
  const { orgId } = store.getters
  const { stationId, stationSlug } = params

  try {
    const query = { organization_id: orgId, $limit: 1 }
    if (q.stationId) query._id = q.stationId
    else if (stationId) query._id = stationId
    else if (stationSlug) query.slug = stationSlug
    else
      return error({
        statusCode: 404,
        message: 'Station not specified.'
      })

    const res = await store.dispatch('stations/find', { query })

    if (!(res && res.data && res.data.length)) {
      return error({
        statusCode: 404,
        message: 'Station not found.'
      })
    }

    store.commit('setStation', res.data[0])
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}

export default async function ({ error, params, store }) {
  const { orgId } = store.getters
  const { stationId, stationSlug } = params

  try {
    const query = { organization_id: orgId, $limit: 1 }
    if (stationId) query._id = stationId
    if (stationSlug) query.slug = stationSlug

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

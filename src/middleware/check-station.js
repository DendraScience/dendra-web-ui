export default async function({ error, params, store }) {
  const { orgId } = store.getters
  const { stationId } = params

  try {
    const res = await store.dispatch('stations/find', {
      query: {
        _id: stationId,
        organization_id: orgId,
        $limit: 1
      }
    })

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

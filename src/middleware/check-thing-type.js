export default async function ({ error, params, store }) {
  const { thingTypeId } = params

  try {
    const res = await store.dispatch('thing-types/find', {
      query: {
        _id: thingTypeId,
        $limit: 1
      }
    })

    if (!(res && res.data && res.data.length)) {
      return error({
        statusCode: 404,
        message: 'Equipment not found.'
      })
    }

    store.commit('setThingType', res.data[0])
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}

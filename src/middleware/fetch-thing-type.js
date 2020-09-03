export default async function ({ error, query, store }) {
  const { thingTypeId } = query

  try {
    if (!thingTypeId) return

    await store.dispatch('thing-types/find', {
      query: {
        _id: thingTypeId,
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

export default async function ({ error, params, store }) {
  const { userId } = params

  try {
    const res = await store.dispatch('users/find', {
      query: {
        _id: userId,
        $limit: 1
      }
    })

    if (!(res && res.data && res.data.length)) {
      return error({
        statusCode: 404,
        message: 'User not found.'
      })
    }

    store.commit('setUser', res.data[0])
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}

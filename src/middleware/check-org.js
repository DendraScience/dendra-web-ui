export default async function({ error, params, store }) {
  const { orgSlug } = params

  try {
    const res = await store.dispatch('organizations/find', {
      query: {
        slug: orgSlug,
        $limit: 1
      }
    })

    if (!(res && res.data && res.data.length)) {
      return error({
        statusCode: 404,
        message: 'Organization not found.'
      })
    }

    store.commit('setOrg', res.data[0])
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}

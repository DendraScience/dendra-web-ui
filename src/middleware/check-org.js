export default async function({ error, params, store }) {
  const { orgId, orgSlug } = params

  try {
    const query = { $limit: 1 }
    if (orgId) query._id = orgId
    if (orgSlug) query.slug = orgSlug

    const res = await store.dispatch('organizations/find', { query })

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

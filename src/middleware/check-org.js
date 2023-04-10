export default async function ({ error, params, query: q, route, store }) {
  const { orgId, orgSlug } = params

  try {
    // manager can able to view both enabled and disabled
    const authorization = route.meta.map(meta => {
      if (meta && typeof meta.authority !== 'undefined') return true
      return false
    })
    const query = { $limit: 1 }

    if (authorization.includes(false)) query.is_enabled = true
    if (q.organizationId) query._id = q.organizationId
    else if (orgId) query._id = orgId
    else if (orgSlug) query.slug = orgSlug
    else
      return error({
        statusCode: 404,
        message: 'Organization not specified.'
      })

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

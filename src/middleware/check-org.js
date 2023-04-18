export default async function ({ error, params, query: q, store }) {
  const { orgId, orgSlug } = params

  try {
    const query = { is_enabled: true, $limit: 1 }
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

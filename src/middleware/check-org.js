export default function ({error, params, store}) {
  // TODO: Don't fetch everytime! Check the store first.
  store.commit('dashboards/clearAll')
  store.commit('organizations/clearCurrent')

  return store.dispatch('organizations/find', {
    query: {
      slug: params.orgSlug,
      $limit: 1
    }
  }).then(res => {
    if (!(res && res.data && res.data.length > 0)) {
      return error({
        statusCode: 404,
        message: 'Organization not found.'
      })
    }

    return res.data[0]
  }).then(organization => {
    store.commit('organizations/setCurrent', organization)

    return store.dispatch('dashboards/find', {
      query: {
        // NOTE: Should this relationship be inverted?
        // _id: {
        //   $in: organization.dashboard_ids
        // }
        organization_id: organization._id,
        enabled: true,
        slug: {$exists: 1},
        $limit: 200,
        $sort: {sort_value: 1, name: 1}
      }
    })
  }).catch(err => {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  })
}

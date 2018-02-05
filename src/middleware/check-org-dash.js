export default function ({error, params, store}) {
  store.commit('dashboards/clearCurrent')

  const res = store.getters['dashboards/find']({
    query: {
      organization_id: store.getters['organizations/current']._id,
      slug: params.dashSlug,
      $limit: 1
    }
  })

  if (!(res && res.data && res.data.length > 0)) {
    return error({
      statusCode: 404,
      message: 'Dashboard not found.'
    })
  }

  store.commit('dashboards/setCurrent', res.data[0])
}

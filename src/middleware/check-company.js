export default async function ({ error, params, store }) {
  const { companyId } = params

  try {
    const res = await store.dispatch('companies/find', {
      query: {
        _id: companyId,
        $limit: 1
      }
    })

    if (!(res && res.data && res.data.length)) {
      return error({
        statusCode: 404,
        message: 'Company not found.'
      })
    }

    store.commit('setCompany', res.data[0])
  } catch (err) {
    error({
      statusCode: err.statusCode || 500,
      message: err.message
    })
  }
}

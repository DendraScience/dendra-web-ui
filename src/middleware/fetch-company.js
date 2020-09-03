export default async function ({ error, query, store }) {
  const { companyId } = query

  try {
    if (!companyId) return

    await store.dispatch('companies/find', {
      query: {
        _id: companyId,
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

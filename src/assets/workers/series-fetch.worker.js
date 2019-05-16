const apiPath = process.env.apiPath
const apiUri = process.env.apiUri

const headers = new Headers()

headers.append('Content-Type', 'application/json')

async function processFetchSpec(
  id,
  { baseQuery, queries, startTime, untilTime }
) {
  self.postMessage({ id, isFetching: true })

  let total = 0

  for (let index = 0; index < queries.length; index++) {
    const query = queries[index]
    let data = []
    let fromTime = startTime

    // TODO: Remove hard limit
    while (data.length < 201600) {
      const url = new URL(`${apiUri}${apiPath}/datapoints`)
      const params = Object.assign({}, baseQuery, query, {
        t_int: true,
        t_local: true,
        time_local: true,
        [data.length ? 'time[$gt]' : 'time[$gte]']: fromTime,
        'time[$lt]': untilTime,
        $limit: 2016,
        '$sort[time]': 1
      })
      Object.keys(params).forEach(key =>
        url.searchParams.append(key, params[key])
      )

      const response = await fetch(url, {
        mode: 'cors',
        cache: 'no-cache',
        headers
      })

      const json = await response.json()

      if (!(json && json.data && json.data.length)) break

      data = data.concat(json.data.map(point => [point.lt, point.v]))
      fromTime = new Date(json.data[json.data.length - 1].lt).toISOString()
    }

    total += data.length

    self.postMessage({ id, series: { data, index }, total })
  }
}

// Respond to message from parent thread
self.addEventListener('message', event => {
  const { data } = event

  if (data.accessToken) {
    headers.set('Authorization', data.accessToken)
  }

  if (data.fetchSpec) {
    const { id } = data

    processFetchSpec(id, data.fetchSpec)
      .then(() => {
        self.postMessage({ id, isDone: true })
      })
      .catch(error => {
        self.postMessage({ id, error })
      })
  }
})

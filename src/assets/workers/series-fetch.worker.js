const api = {}
const processIds = {}
const datapointsMax = process.env.datapointsMax
const headers = new Headers()

headers.append('Content-Type', 'application/json')
headers.append('Dendra-Fetch-Action', 'graph')

async function processFetch({ id, fetchSpec }) {
  const { baseQuery, queries, startTime, untilTime } = fetchSpec
  let total = 0

  for (let index = 0; index < queries.length; index++) {
    const query = queries[index]
    const data = []
    let fromTime = startTime

    while (processIds[id] !== undefined) {
      if (data.length > datapointsMax) {
        self.postMessage({
          id,
          message: `The maximum number of datapoints (${datapointsMax}) has been exceeded.`
        })
        break
      }

      const url = new URL(`${api.uri}${api.path}/datapoints`)
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

      if (!response.ok) {
        if (json && json.name && json.message) {
          throw json
        } else {
          throw new Error(`Non-success status code ${response.status}`)
        }
      }

      if (!(json && Array.isArray(json.data) && json.data.length)) break

      for (let i = 0; i < json.data.length; i++) {
        const { lt, v } = json.data[i]
        data.push([lt, v])
      }

      total += json.data.length

      self.postMessage({ id, total })

      fromTime = json.data[json.data.length - 1].lt
    }

    self.postMessage({ id, series: { data, index } })
  }
}

// Respond to message from parent thread
self.addEventListener('message', event => {
  const { data } = event
  const { id } = data

  if (data.accessToken) {
    headers.set('Authorization', data.accessToken)
  }

  if (data.api) {
    Object.assign(api, data.api)
  }

  if (id !== undefined && data.cancel === true) {
    delete processIds[id]
  }

  if (id !== undefined && data.fetchSpec && !processIds[id]) {
    self.postMessage({ id, isFetching: true })

    processIds[id] = true
    processFetch(data).then(
      () => {
        self.postMessage({ id, isFetching: false })
        delete processIds[id]
      },
      err => {
        self.postMessage({
          id,
          error: {
            message: err.message,
            name: err.name
          },
          isFetching: false
        })
        delete processIds[id]
      }
    )
  }
})

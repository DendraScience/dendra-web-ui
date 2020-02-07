import { WorkerFetcher } from '@/lib/worker-fetcher'

const datapointsMax = process.env.datapointsMax
const fetcher = new WorkerFetcher({ processFetch, self })
const { api, headers, processIds } = fetcher

headers.append('Dendra-Fetch-Action', 'graph')

// Respond to message from parent thread
self.addEventListener('message', fetcher.messageHandler.bind(fetcher))

async function processFetch({ id, fetchSpec }) {
  const { baseQuery, queries, startTime, untilTime, useDummyWY } = fetchSpec
  let first
  let point
  let total = 0
  let value

  for (let index = 0; index < queries.length; index++) {
    const query = queries[index]
    const data = []
    const v = query.uom_id ? 'uv' : 'v'
    let fromTime = Array.isArray(startTime) ? startTime[index] : startTime

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
        // t_local: true,
        time_local: true,
        [data.length ? 'time[$gt]' : 'time[$gte]']: fromTime,
        'time[$lt]': Array.isArray(untilTime) ? untilTime[index] : untilTime,
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

      if (!(json && json.data && json.data.length)) break

      if (useDummyWY) {
        for (let i = 0; i < json.data.length; i++) {
          point = json.data[i]
          value = point[v]

          if (!first) first = { point, value }

          // HACK: Toss everything except hourly points (MOVE TO THE BACKEND!)
          const date = new Date(point.lt)
          if (date.getUTCMinutes() > 0) continue

          /*
            All series have a dummy year in order to be compared on the same x axis.
            Make sure we use a leap year (e.g. 1972)!
           */

          date.setUTCFullYear(date.getUTCMonth() > 8 ? 1971 : 1972)

          data.push([date.getTime(), value])
        }
      } else {
        for (let i = 0; i < json.data.length; i++) {
          point = json.data[i]
          value = point[v]

          if (!first) first = { point, value }

          data.push([point.lt, value])
        }
      }

      total += json.data.length

      self.postMessage({ id, total })

      fromTime = json.data[json.data.length - 1].lt
    }

    self.postMessage({
      first,
      id,
      last: { point, value },
      query,
      series: { data, index }
    })
  }
}

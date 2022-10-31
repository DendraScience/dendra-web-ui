import { WorkerFetcher } from '@/lib/worker-fetcher'

const datapointsMax = process.env.datapointsMax
const fetcher = new WorkerFetcher({ processFetch, self })
const { api, headers, processIds } = fetcher

headers.append('Dendra-Fetch-Action', 'graph')

// Respond to message from parent thread
self.addEventListener('message', fetcher.messageHandler.bind(fetcher))

async function processFetch({ id, fetchSpec }) {
  const {
    baseQuery,
    queries,
    seriesType,
    startTime,
    timeLocal = true,
    untilTime
  } = fetchSpec
  let total = 0

  for (let index = 0; index < queries.length; index++) {
    const query = queries[index]
    const { config } = query
    const sampleInterval = config && config.sample_interval
    delete query.config
    const data = []
    const toTime = Array.isArray(untilTime) ? untilTime[index] : untilTime
    let currTime
    let fromTime = Array.isArray(startTime) ? startTime[index] : startTime
    let nextTime
    let prevTime
    let first
    let point
    let value

    while (processIds[id] !== undefined) {
      if (data.length > datapointsMax) {
        self.postMessage({
          id,
          message: `The maximum number of datapoints (${datapointsMax}) has been exceeded.`
        })
        break
      }

      const url = new URL(`${api.uri}${api.path}/datapoints`)
      const params = Object.assign(
        {
          t_int: true,
          $limit: 2016
        },
        baseQuery,
        query,
        {
          time_local: timeLocal,
          [data.length ? 'time[$gt]' : 'time[$gte]']: fromTime,
          '$sort[time]': 1
        }
      )
      if (toTime) params['time[$lt]'] = toTime
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

      const v = query.uom_id ? 'uv' : 'v'

      if (seriesType === 'waterYear') {
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
      } else if (json.data[0].lt) {
        for (let i = 0; i < json.data.length; i++) {
          point = json.data[i]
          value = point[v]

          if (!first) first = { point, value }

          currTime = point.lt

          if (currTime - prevTime > sampleInterval) {
            nextTime =
              (Math.floor(prevTime / sampleInterval) + 1) * sampleInterval
            while (nextTime < currTime) {
              data.push([nextTime, null])
              nextTime += sampleInterval
            }
          }

          prevTime = currTime

          data.push([currTime, value])
        }
      } else {
        // HACK: Handle data services that don't return 'lt' (e.g. NWS)
        for (let i = 0; i < json.data.length; i++) {
          point = json.data[i]
          value = point[v]

          if (!first) first = { point, value }

          data.push([new Date(point.t).getTime() + point.o * 1000, value])
        }
      }

      total += json.data.length

      self.postMessage({ id, total })

      if (untilTime === undefined) break

      fromTime = json.data[json.data.length - 1][timeLocal ? 'lt' : 't']
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

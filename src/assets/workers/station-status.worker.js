import { WorkerFetcher } from '@/lib/worker-fetcher'

const fetcher = new WorkerFetcher({ processFetch, self })
const { api, headers } = fetcher

headers.append('Dendra-Fetch-Action', 'graph')

// Respond to message from parent thread
self.addEventListener('message', fetcher.messageHandler.bind(fetcher))

async function getBatteryVoltageDatastream(stationId) {
  const url = new URL(`${api.uri}${api.path}/datastreams`)
  const params = {
    is_enabled: true,
    station_id: stationId,
    '$and[0][terms_info.class_tags]': 'ds_Function_Status',
    '$and[1][terms_info.class_tags]': 'ds_Medium_Battery',
    '$and[2][terms_info.class_tags]': 'ds_Variable_Voltage',
    $limit: 1,
    '$select[]': '_id',
    '$sort[_id]': 1
  }
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  const response = await fetch(url, {
    mode: 'cors',
    cache: 'no-cache',
    headers
  })

  const json = await response.json()

  if (!response.ok)
    throw new Error(`Non-success status code ${response.status}`)

  if (!(json && json.data && json.data.length))
    throw new Error(`No Batery Voltage datastream for station ${stationId}`)

  return json.data[0]
}

async function fetchLastSeen(id, query) {
  const url = new URL(`${api.uri}${api.path}/datapoints`)
  const params = Object.assign({}, query, {
    t_int: true,
    $limit: 1
  })
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

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

  if (json && json.data && json.data.length) {
    self.postMessage({
      id,
      result: {
        lastSeenTime: json.data[0].t
      }
    })
  }
}

async function fetchSeries(id, index, query, { startTime }) {
  const data = []

  const url = new URL(`${api.uri}${api.path}/datapoints`)
  const params = Object.assign(
    {
      t_int: true,
      $limit: 2016
    },
    query,
    {
      'time[$gte]': startTime,
      '$sort[time]': 1
    }
  )
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

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

  if (json && json.data && json.data.length) {
    for (let i = 0; i < json.data.length; i++) {
      const { t, v } = json.data[i]
      data.push([t, v])
    }
  }

  self.postMessage({ id, series: { data, index } })
}

async function processFetch({ id, cache, fetchSpec }) {
  let { batteryVoltageDatastream } = cache

  if (!batteryVoltageDatastream)
    batteryVoltageDatastream = await getBatteryVoltageDatastream(
      fetchSpec.stationId
    )

  self.postMessage({ id, cache: { batteryVoltageDatastream } })

  await fetchLastSeen(id, { datastream_id: batteryVoltageDatastream._id })
  await fetchSeries(
    id,
    0,
    { datastream_id: batteryVoltageDatastream._id },
    fetchSpec
  )
}

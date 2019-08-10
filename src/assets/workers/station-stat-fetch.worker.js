const api = {}
const processIds = {}
const headers = new Headers()

headers.append('Content-Type', 'application/json')
headers.append('Dendra-Fetch-Action', 'graph')

async function getBatteryVoltageDatastreamId(stationId) {
  const url = new URL(`${api.uri}${api.path}/datastreams`)
  const params = {
    is_enabled: true,
    station_id: stationId,
    '$and[0][terms_info.class_tags]': 'ds_Medium_Battery',
    '$and[1][terms_info.class_tags]': 'ds_Variable_Voltage',
    // HACK: Not pretty - the metadata should never require this!
    // FIX: Find another way
    'datapoints_config.params.query.db[$exists]': true,
    $limit: 1,
    '$select[]': '_id',
    '$sort[terms_info.class_keys]': 1
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

  if (!(json && Array.isArray(json.data) && json.data.length))
    throw new Error(`No Batery Voltage datastream for station ${stationId}`)

  return json.data[0]._id
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

  if (json && Array.isArray(json.data) && json.data.length) {
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
  const params = Object.assign({}, query, {
    t_int: true,
    'time[$gte]': startTime,
    $limit: 2016,
    '$sort[time]': 1
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

  if (json && Array.isArray(json.data) && json.data.length) {
    for (let i = 0; i < json.data.length; i++) {
      const { t, v } = json.data[i]
      data.push([t, v])
    }
  }

  self.postMessage({ id, series: { data, index } })
}

async function processFetch({ id, cache, fetchSpec }) {
  let { batteryVoltageDatastreamId } = cache

  if (!batteryVoltageDatastreamId)
    batteryVoltageDatastreamId = await getBatteryVoltageDatastreamId(
      fetchSpec.stationId
    )

  self.postMessage({ id, cache: { batteryVoltageDatastreamId } })

  await fetchLastSeen(id, { datastream_id: batteryVoltageDatastreamId })
  await fetchSeries(
    id,
    0,
    { datastream_id: batteryVoltageDatastreamId },
    fetchSpec
  )
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

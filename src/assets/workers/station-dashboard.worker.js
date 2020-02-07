import _sortBy from 'lodash/sortBy'
import { WorkerFetcher } from '@/lib/worker-fetcher'

const fetcher = new WorkerFetcher({ processFetch, self })
const { api, headers } = fetcher

// Respond to message from parent thread
self.addEventListener('message', fetcher.messageHandler.bind(fetcher))

// TODO: Verify indicies for status and dashboard

function selectDatastreamsByAggregate(datastreams) {
  // Average
  let filtered = datastreams.filter(
    datastream => datastream.terms.ds.Aggregate === 'Average'
  )
  if (filtered.length) return filtered

  // Sample
  filtered = datastreams.filter(datastream => !datastream.terms.ds.Aggregate)
  if (filtered.length) return filtered

  // Maximum
  filtered = datastreams.filter(
    datastream => datastream.terms.ds.Aggregate === 'Maximum'
  )
  if (filtered.length) return filtered

  // Minimum
  filtered = datastreams.filter(
    datastream => datastream.terms.ds.Aggregate === 'Mininum'
  )
  if (filtered.length) return filtered

  return datastreams
}

async function processFetch({ id, fetchSpec }) {
  const { stationId } = fetchSpec

  const url = new URL(`${api.uri}${api.path}/datastreams`)
  const params = {
    is_enabled: true,
    is_hidden: false,
    station_id: stationId,
    $limit: 200,
    '$select[0]': '_id',
    '$select[1]': 'attributes',
    '$select[2]': 'general_config',
    '$select[3]': 'name',
    '$select[4]': 'terms',
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

  let datastreams = json && json.data ? json.data : []

  // Rank based on priority
  datastreams.forEach(datastream => {
    datastream.__rank =
      datastream.general_config &&
      datastream.general_config.station_dashboard_priority !== undefined
        ? -datastream.general_config.station_dashboard_priority
        : -1
  })

  // Filter and sort
  datastreams = datastreams.filter(
    datastream => datastream.terms.ds && datastream.__rank < 0
  )
  datastreams = _sortBy(datastreams, ['__rank', '_id'])

  // Cherry-pick
  const datastreamsByKey = {
    airSpeedAverage: datastreams.find(
      datastream =>
        !datastream.attributes &&
        datastream.terms.ds.Aggregate === 'Average' &&
        datastream.terms.ds.Medium === 'Air' &&
        datastream.terms.ds.Variable === 'Speed'
    ),

    airSpeedMaximum: datastreams.find(
      datastream =>
        !datastream.attributes &&
        datastream.terms.ds.Aggregate === 'Maximum' &&
        datastream.terms.ds.Medium === 'Air' &&
        datastream.terms.ds.Variable === 'Speed'
    ),

    airTemperature: selectDatastreamsByAggregate(
      datastreams.filter(
        datastream =>
          !datastream.attributes &&
          datastream.terms.ds.Medium === 'Air' &&
          datastream.terms.ds.Variable === 'Temperature'
      )
    )[0],

    airTemperaturesAtHeight: _sortBy(
      selectDatastreamsByAggregate(
        datastreams.filter(
          datastream =>
            datastream.attributes &&
            datastream.attributes.height &&
            datastream.attributes.height.value &&
            datastream.terms.ds.Medium === 'Air' &&
            datastream.terms.ds.Variable === 'Temperature'
        )
      ),
      ['attributes.height.value']
    ),

    barometricPressure: selectDatastreamsByAggregate(
      datastreams.filter(
        datastream =>
          !datastream.attributes &&
          datastream.terms.ds.Medium === 'Air' &&
          datastream.terms.ds.Variable === 'BarometricPressure'
      )
    )[0],

    batteryVoltage: datastreams.find(
      datastream =>
        !datastream.attributes &&
        datastream.terms.ds.Function === 'Status' &&
        datastream.terms.ds.Medium === 'Battery' &&
        datastream.terms.ds.Variable === 'Voltage'
    ),

    cumulativePrecipitation: datastreams.find(
      datastream =>
        !datastream.attributes &&
        datastream.terms.ds.Aggregate === 'Cumulative' &&
        datastream.terms.ds.Medium === 'Water' &&
        datastream.terms.ds.Variable === 'Precipitation'
    ),

    par: selectDatastreamsByAggregate(
      datastreams.filter(
        datastream =>
          !datastream.attributes &&
          datastream.terms.ds.Medium === 'Solar' &&
          datastream.terms.ds.Variable ===
            'PhotosyntheticallyActiveRadiation' &&
          datastream.terms.dt.Unit === 'MicromolePerSquareMeter'
      )
    )[0],

    relativeHumidity: selectDatastreamsByAggregate(
      datastreams.filter(
        datastream =>
          !datastream.attributes &&
          datastream.terms.ds.Medium === 'Air' &&
          datastream.terms.ds.Variable === 'RelativeHumidity' &&
          datastream.terms.dt.Unit === 'Percent'
      )
    )[0],

    soilTemperaturesAtDepth: _sortBy(
      selectDatastreamsByAggregate(
        datastreams.filter(
          datastream =>
            datastream.attributes &&
            datastream.attributes.depth &&
            datastream.attributes.depth.value &&
            datastream.terms.ds.Medium === 'Soil' &&
            datastream.terms.ds.Variable === 'Temperature'
        )
      ),
      ['attributes.depth.value']
    ),

    solarRadiation: selectDatastreamsByAggregate(
      datastreams.filter(
        datastream =>
          !datastream.attributes &&
          datastream.terms.ds.Medium === 'Solar' &&
          datastream.terms.ds.Variable === 'Radiation' &&
          datastream.terms.dt.Unit === 'WattPerSquareMeter'
      )
    )[0]
  }

  self.postMessage({ id, datastreams, datastreamsByKey })
}

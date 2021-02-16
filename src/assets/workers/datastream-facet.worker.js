import { FacetIndexer } from '@/lib/facet-indexer'
import { WorkerFetcher } from '@/lib/worker-fetcher'

const fetcher = new WorkerFetcher({ processFetch, self })
const { api, headers } = fetcher

// Respond to message from parent thread
self.addEventListener('message', fetcher.messageHandler.bind(fetcher))

async function processFetch({ id, fetchSpec }) {
  const { isEnabled, orgId, schemeId, stationId } = fetchSpec

  const url = new URL(`${api.uri}${api.path}/datastreams`)
  const params = {
    is_hidden: false,
    organization_id: orgId,
    $limit: 2000,
    '$select[_id]': 1,
    '$select[access_levels_resolved]': 1,
    '$select[description]': 1,
    '$select[extent]': 1,
    '$select[general_config_resolved]': 1,
    '$select[is_hidden]': 1,
    '$select[name]': 1,
    '$select[organization_id]': 1,
    '$select[station_id]': 1,
    '$select[station_lookup]': 1,
    '$select[terms]': 1
  }

  if (isEnabled !== undefined) params.is_enabled = isEnabled
  if (stationId !== undefined) params.station_id = stationId

  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  const response = await fetch(url, {
    mode: 'cors',
    cache: 'no-cache',
    headers
  })

  const json = await response.json()

  if (!response.ok)
    throw new Error(`Non-success status code ${response.status}`)

  const datastreams = json && json.data ? json.data : []
  const indexer = new FacetIndexer()

  datastreams.forEach((datastream, index) => {
    const { station_id: stationId, terms } = datastream

    if (stationId) indexer.add('Station', stationId, index)

    if (terms[schemeId]) {
      const keys = Object.keys(terms[schemeId])
      keys.forEach(key => indexer.add(key, terms[schemeId][key], index))
    }

    if (terms.dt && terms.dt.Unit) indexer.add('Unit', terms.dt.Unit, index)
  })

  self.postMessage({ id, datastreams, indexer })
}

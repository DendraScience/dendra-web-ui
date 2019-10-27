import { FacetIndexer } from '@/lib/facet-indexer'

const api = {}
const processIds = {}
const headers = new Headers()

headers.append('Content-Type', 'application/json')

// TODO: Can this be deleted?
// async function getUnitVocabulary() {
//   const url = new URL(`${api.uri}${api.path}/vocabularies/dt-unit`)

//   const response = await fetch(url, {
//     mode: 'cors',
//     cache: 'no-cache',
//     headers
//   })

//   const json = await response.json()

//   if (!response.ok)
//     throw new Error(`Non-success status code ${response.status}`)

//   if (!json) throw new Error(`No unit type vocabulary`)

//   return json
// }

async function processFetch({ id, fetchSpec }) {
  const { isEnabled, orgId, schemeId, stationId } = fetchSpec

  // TODO: Can this be deleted?
  // const unitVocabulary = await getUnitVocabulary()

  const url = new URL(`${api.uri}${api.path}/datastreams`)
  const params = {
    is_hidden: false,
    organization_id: orgId,
    $limit: 2000,
    '$select[_id]': 1,
    '$select[access_levels_resolved]': 1,
    '$select[description]': 1,
    '$select[is_enabled]': 1,
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

    if (terms.dt && terms.dt.Unit) {
      indexer.add('Unit', terms.dt.Unit, index)

      // TODO: Can this be deleted?
      // const term = unitVocabulary.terms.find(
      //   term => term.label === terms.dt.Unit
      // )
      // if (term) datastream.unitTerm = term
    }
  })

  self.postMessage({ id, datastreams, indexer })
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

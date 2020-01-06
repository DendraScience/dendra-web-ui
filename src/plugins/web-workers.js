import DatastreamFacetWorker from '@/assets/workers/datastream-facet.worker'
import SeriesFetchWorker from '@/assets/workers/series-fetch.worker'
import StatusFetchWorker from '@/assets/workers/status-fetch.worker'

export default (_, inject) => {
  inject('workers', {
    createDatastreamFacetWorker: () => new DatastreamFacetWorker(),
    createSeriesFetchWorker: () => new SeriesFetchWorker(),
    createStatusFetchWorker: () => new StatusFetchWorker()
  })
}

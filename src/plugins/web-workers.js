import DatastreamFacetWorker from '@/assets/workers/datastream-facet.worker'
import SeriesFetchWorker from '@/assets/workers/series-fetch.worker'
import StationStatFetchWorker from '@/assets/workers/station-stat-fetch.worker'

export default (_, inject) => {
  inject('workers', {
    createDatastreamFacetWorker: () => new DatastreamFacetWorker(),
    createSeriesFetchWorker: () => new SeriesFetchWorker(),
    createStationStatFetchWorker: () => new StationStatFetchWorker()
  })
}

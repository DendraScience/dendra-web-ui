import DatastreamFacetWorker from '@/assets/workers/datastream-facet.worker'
import SeriesFetchWorker from '@/assets/workers/series-fetch.worker'
import StationDashboardWorker from '@/assets/workers/station-dashboard.worker'
import StationStatusWorker from '@/assets/workers/station-status.worker'

export default (_, inject) => {
  inject('workers', {
    createDatastreamFacetWorker: () => new DatastreamFacetWorker(),
    createSeriesFetchWorker: () => new SeriesFetchWorker(),
    createStationDashboardWorker: () => new StationDashboardWorker(),
    createStationStatusWorker: () => new StationStatusWorker()
  })
}

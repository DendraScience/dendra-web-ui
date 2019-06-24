import SeriesFetchWorker from '@/assets/workers/series-fetch.worker'
import StationStatFetchWorker from '@/assets/workers/station-stat-fetch.worker'

export default (_, inject) => {
  inject('workers', {
    createSeriesFetchWorker: () => new SeriesFetchWorker(),
    createStationStatFetchWorker: () => new StationStatFetchWorker()
  })
}

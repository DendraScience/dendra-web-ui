import SeriesFetchWorker from '@/assets/workers/series-fetch.worker'

export default (_, inject) => {
  inject('workers', {
    createSeriesFetchWorker: () => new SeriesFetchWorker()
  })
}

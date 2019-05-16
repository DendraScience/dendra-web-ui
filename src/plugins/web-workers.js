import SeriesFetchWorker from '@/assets/workers/series-fetch.worker'

export default ({ store }, inject) => {
  inject('workers', {
    createSeriesFetchWorker() {
      return new SeriesFetchWorker()
    }
  })
}

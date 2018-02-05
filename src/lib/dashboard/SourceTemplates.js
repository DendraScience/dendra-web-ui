export default {
  _default: {
    // TODO: Define default specification
  },

  seriesAsc: {
    clear_hook: 'channel',
    guard_hook: 'seriesAsc',
    before_fetch_hook: 'seriesAsc',
    fetch_hook: 'result',
    fetch_queries: [],
    query_builder: 'seriesAsc',
    after_fetch_hook: 'seriesAsc',
    assign_hook: 'result'
  }
}

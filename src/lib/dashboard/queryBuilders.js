export default {
  seriesAsc (spec, model, query) {
    const opts = spec.options
    const topic = spec.topic
    const channel = model.$store.getters['channels/get'](topic)
    const cursor = channel.cursor

    return Object.assign({
      time: {
        $gte: cursor.start.toISOString(),
        $lt: cursor.pos.toISOString()
      },
      time_local: !(opts && opts.useWallTime === true),
      $limit: 2000,
      $sort: {time: 1} // ASC
    }, query)
  }
}

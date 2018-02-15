export default {
  seriesAsc (spec, model) {
    const topic = spec.topic
    const channel = model.$store.getters['channels/get'](topic)
    const cursor = channel.cursor
    const systemTime = model.$store.getters['systemTime/current']

    return (systemTime && (!cursor || (cursor.start < cursor.end)) && (channel.errorLimit > 0))
  }
}

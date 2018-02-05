export default {
  channel (spec, model) {
    model.$store.commit('channels/initTopic', spec.topic)
  }
}

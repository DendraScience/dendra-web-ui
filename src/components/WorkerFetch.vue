<script>
import _isEqual from 'lodash/isEqual'

export default {
  props: {
    bus: {
      default: null,
      type: Object
    },
    id: {
      default: 0,
      type: [Number, String]
    },
    fetchSpec: {
      default: () => ({}),
      type: Object
    },
    worker: { default: null, type: Worker }
  },

  data: () => ({
    cache: {},
    result: {}
  }),

  watch: {
    fetchSpec(newValue, oldValue) {
      // HACK: Do a proper deep compare
      if (!_isEqual(newValue, oldValue)) this.fetch()
    }
  },

  created() {
    // Handle HMR so we can debug
    // SEE: https://webpack.github.io/docs/hot-module-replacement.html
    if (module.hot) {
      this.worker.removeEventListener('message', this.workerMessageHandler)
    }
    this.worker.addEventListener('message', this.workerMessageHandler)
  },

  mounted() {
    if (this.bus) this.bus.$on('fetch', this.fetch)

    this.fetch()
  },

  beforeDestroy() {
    if (this.bus) this.bus.$off('fetch', this.fetch)

    this.worker.postMessage({
      id: this.id,
      cancel: true
    })
    this.worker.removeEventListener('message', this.workerMessageHandler)
  },

  methods: {
    fetch(message) {
      this.worker.postMessage(
        Object.assign(
          {},
          {
            id: this.id,
            cache: this.cache,
            fetchSpec: this.fetchSpec
          },
          message
        )
      )
    },

    workerMessageHandler(event) {
      const { data } = event

      if (data.id !== this.id) return

      if (data.error) this.$logger.error(data.error)

      if (data.cache) this.cache = Object.assign({}, this.cache, data.cache)
      if (data.result) this.result = Object.assign({}, this.result, data.result)

      this.$emit('data', data)
    }
  },

  render() {
    return this.$scopedSlots.default({
      result: this.result
    })
  }
}
</script>

export default {
  data: () => ({
    datapointsConfig: {
      dialog: false
    }
  }),

  methods: {
    addDatapointsConfig() {
      this.datapointsConfig = {
        dialog: true
      }

      requestAnimationFrame(() => {
        this.$refs.datapointsConfigDialog.$refs.observer.reset()
      })
    },

    editDatapointsConfig() {},

    commitDatapointsConfig() {},

    removeDatapointsConfig() {}
  }
}

export default {
  data: () => ({
    isTimerEnabled: true,
    timerId: null,
    timerInterval: 60000
  }),

  watch: {
    isTimerEnabled() {
      this.resetTimer()
    },

    timerInterval() {
      this.resetTimer()
    }
  },

  mounted() {
    this.resetTimer()
  },

  beforeDestroy() {
    this.clearTimer()
  },

  methods: {
    clearTimer() {
      if (this.timerId) clearTimeout(this.timerId)

      this.timerId = null
    },

    resetTimer() {
      this.clearTimer()

      if (this.isTimerEnabled)
        this.timerId = setTimeout(() => {
          Promise.resolve().then(this.timerCallback).finally(this.resetTimer)
        }, this.timerInterval)
    },

    async timerCallback() {}
  }
}

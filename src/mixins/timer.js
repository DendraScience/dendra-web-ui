export default {
  data: () => ({
    isTimerEnabled: true,
    timerId: null,
    timerFiredAt: null,
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

    fireTimer(...args) {
      this.clearTimer()
      this.timerFiredAt = new Date()
      return Promise.resolve()
        .then(() => this.timerCallback(...args))
        .finally(this.resetTimer)
    },

    resetTimer() {
      this.clearTimer()
      if (this.isTimerEnabled)
        this.timerId = setTimeout(() => this.fireTimer(), this.timerInterval)
    },

    async timerCallback() {}
  }
}

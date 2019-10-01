import {
  dateRangeFromItem,
  defaultDateRange,
  newDateRange,
  resolveDateRange,
  resolvedToIntervalMoment,
  resolvedToIntervalRange
} from '@/lib/date'

export default {
  data: () => ({
    momentInterval: {
      dialog: false,
      dateRange: newDateRange()
    },
    rangeInterval: {
      dialog: false,
      dateRange: newDateRange()
    },
    intervalKey: -1
  }),

  computed: {
    momentIntervalResolved() {
      return resolveDateRange(this.momentInterval.dateRange)
    },

    rangeIntervalResolved() {
      return resolveDateRange(this.rangeInterval.dateRange)
    }
  },

  methods: {
    addInterval(item) {
      const dateRange = defaultDateRange()
      if (item.target === 'moment') dateRange.toEnabled = false
      this[`${item.target}Interval`] = {
        dialog: true,
        dateRange
      }
      this.intervalKey = -1

      requestAnimationFrame(() => {
        this.$refs[`${item.target}IntervalDialog`].$refs.observer.reset()
      })
    },

    editInterval(item) {
      this[`${item.target}Interval`] = {
        dialog: true,
        dateRange: dateRangeFromItem(item)
      }
      this.intervalKey = item.key

      requestAnimationFrame(() => {
        this.$refs[`${item.target}IntervalDialog`].$refs.observer.reset()
      })
    },

    commitMomentInterval() {
      const {
        momentIntervalResolved: dateRangeResolved,
        intervalKey,
        value
      } = this
      const newInterval = resolvedToIntervalMoment(dateRangeResolved)

      if (intervalKey > -1) {
        value.intervals = value.intervals.map((interval, index) =>
          index === intervalKey ? newInterval : interval
        )
      } else {
        value.intervals.push(newInterval)
      }

      this.momentInterval.dialog = false
    },

    commitRangeInterval() {
      const {
        rangeIntervalResolved: dateRangeResolved,
        intervalKey,
        value
      } = this
      const newInterval = resolvedToIntervalRange(dateRangeResolved)

      if (intervalKey > -1) {
        value.intervals = value.intervals.map((interval, index) =>
          index === intervalKey ? newInterval : interval
        )
      } else {
        value.intervals.push(newInterval)
      }

      this.rangeInterval.dialog = false
    },

    removeInterval(item) {
      this.value.intervals = this.value.intervals.filter(
        (interval, index) => index !== item.key
      )
    }
  }
}

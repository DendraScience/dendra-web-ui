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
    intervalKey: -1,
    timeZone: null,
    timeZoneAccepted: false
  }),

  computed: {
    momentIntervalResolved() {
      return resolveDateRange(this.momentInterval.dateRange)
    },

    rangeIntervalResolved() {
      return resolveDateRange(this.rangeInterval.dateRange)
    }
  },

  watch: {
    timeZone() {
      this.timeZoneAccepted = true
    }
  },

  methods: {
    addInterval(item) {
      const dateRange = defaultDateRange(item)
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
        timeZoneAccepted,
        value
      } = this

      if (!timeZoneAccepted) {
        this.timeZone = dateRangeResolved.timeZone
        this.timeZoneAccepted = true

        const detailIntervals = this.$refs.detailIntervals
        this.$nextTick(() => {
          if (intervalKey > -1)
            this.editInterval(detailIntervals.items[intervalKey])
          else
            this.addInterval(
              detailIntervals.addItems.find(item => item.target === 'moment')
            )
        })

        return
      }

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
        timeZoneAccepted,
        value
      } = this

      if (!timeZoneAccepted) {
        this.timeZone = dateRangeResolved.timeZone
        this.timeZoneAccepted = true

        const detailIntervals = this.$refs.detailIntervals
        this.$nextTick(() => {
          if (intervalKey > -1)
            this.editInterval(detailIntervals.items[intervalKey])
          else
            this.addInterval(
              detailIntervals.addItems.find(item => item.target === 'range')
            )
        })

        return
      }

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

import _set from 'lodash/set'
import moment from 'moment'

const WEEKDAYS = moment.weekdays()

export default {
  props: {
    units: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  computed: {
    items() {
      const { value } = this
      const bins = {}

      Object.keys(value).forEach(key => {
        const keyedValue = value[key]

        if (!keyedValue) return

        const { data } = keyedValue

        data.forEach(item => {
          const date = new Date(item[0])
          const path = date.toISOString().substring(0, 10)
          const name = WEEKDAYS[date.getUTCDay()]

          _set(bins, `${path}.name`, name)

          _set(
            bins,
            `${path}.${date.getUTCHours() >= 18 ? 'night' : 'day'}.${key}`,
            item[1]
          )
        })
      })

      return Object.keys(bins)
        .sort()
        .map(key => bins[key])
    }
  },

  methods: {
    hasDay(item) {
      return (
        item.day &&
        item.day.conditionsIcon &&
        item.day.conditionsIcon.url &&
        item.day.weather &&
        item.day.weather.summary &&
        item.day.temperatureMaximum !== undefined
      )
    },

    hasNight(item) {
      return (
        item.night &&
        item.night.conditionsIcon &&
        item.night.conditionsIcon.url &&
        item.night.weather &&
        item.night.weather.summary &&
        item.night.temperatureMinimum !== undefined
      )
    },

    iconURL(value) {
      if (value) {
        const parts = value.split('/')
        if (parts.length > 0)
          return `${window.__env.noaaNWSIcons || process.env.noaaNWSIcons}/${
            parts[parts.length - 1]
          }`
      }
    }
  }
}

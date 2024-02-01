import math from '@/lib/math'

export default {
  props: {
    units: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    measurements: [
      {
        name: 'Today',
        unitKey: 'precipitation',
        valueKey: 'today'
      },
      {
        name: 'Yesterday',
        unitKey: 'precipitation',
        valueKey: 'yesterday'
      },
      {
        name: '7 days',
        unitKey: 'precipitation',
        valueKey: 'total7Days'
      },
      {
        name: '14 days',
        unitKey: 'precipitation',
        valueKey: 'total14Days'
      },
      {
        name: '30 days',
        unitKey: 'precipitation',
        valueKey: 'total30Days'
      },
      {
        name: 'WY to date',
        unitKey: 'precipitation',
        valueKey: 'wyToDate'
      }
    ]
  }),

  computed: {
    items() {
      const { units, value } = this

      const measurements = this.measurements.map(measurement => {
        const { unitKey, valueKey } = measurement
        const newMeasurement = Object.assign(
          {
            unit: null,
            value: null
          },
          measurement
        )

        if (units && units[unitKey]) newMeasurement.unit = units[unitKey]

        if (value && value[valueKey]) {
          const last = value[valueKey]
          if (last.value !== undefined)
            newMeasurement.value = math.round(last.value, 4)
        }

        return newMeasurement
      })

      return measurements
    }
  }
}

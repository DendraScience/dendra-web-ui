import math from '@/lib/math'

export default {
  props: {
    datastreamsByKey: { default: null, type: Object },
    org: { default: null, type: Object },
    units: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    measurements: [
      {
        datastreamKey: 'batteryVoltage',
        name: 'Battery voltage',
        unitKey: 'batteryVoltage',
        valueKey: 'batteryVoltage'
      },
      {
        datastreamKey: 'airTemperature',
        name: 'Air temperature',
        unitKey: 'temperature',
        valueKey: 'airTemperature'
      },
      {
        datastreamKey: 'relativeHumidity',
        name: 'Relative humidity',
        unitKey: 'relativeHumidity',
        valueKey: 'relativeHumidity'
      },
      {
        datastreamKey: 'barometricPressure',
        name: 'Barometric pressure',
        unitKey: 'barometricPressure',
        valueKey: 'barometricPressure'
      },
      {
        datastreamKey: 'barometricPressure',
        name: 'Mean sea-level pressure',
        unitKey: 'barometricPressure',
        valueKey: 'meanSeaLevelPressure'
      },
      {
        datastreamKey: 'par',
        name: 'PAR',
        unitKey: 'par',
        valueKey: 'par'
      },
      {
        datastreamKey: 'solarRadiation',
        name: 'Total solar',
        unitKey: 'solarRadiation',
        valueKey: 'solarRadiation'
      },
      {
        datastreamKey: 'cumulativePrecipitation',
        name: "Today's rainfall",
        unitKey: 'precipitation',
        valueKey: 'rainfallToday'
      },
      {
        datastreamKey: 'cumulativePrecipitation',
        name: "Yesterday's rainfall",
        unitKey: 'precipitation',
        valueKey: 'rainfallYesterday'
      },
      {
        datastreamKey: 'cumulativePrecipitation',
        name: 'WY precipitation to date',
        unitKey: 'precipitation',
        valueKey: 'wyPrecipToDate'
      },
      {
        datastreamKey: 'airSpeed',
        name: 'Wind speed',
        unitKey: 'speed',
        valueKey: 'windSpeed'
      },
      {
        datastreamKey: 'airDirection',
        name: 'Wind direction',
        unitKey: 'direction',
        valueKey: 'windDirection'
      }
    ]
  }),

  computed: {
    items() {
      const { datastreamsByKey, units, value } = this

      const measurements = this.measurements.map(measurement => {
        const { datastreamKey, unitKey, valueKey } = measurement
        const newMeasurement = Object.assign(
          {
            datastream: null,
            lastSeenTime: null,
            unit: null,
            value: null
          },
          measurement
        )

        if (datastreamsByKey && datastreamsByKey[datastreamKey])
          newMeasurement.datastream = datastreamsByKey[datastreamKey]

        if (units && units[unitKey]) newMeasurement.unit = units[unitKey]

        if (value && value[valueKey]) {
          const last = value[valueKey]
          if (last.point !== undefined)
            newMeasurement.lastSeenTime = last.point.t
          if (last.value !== undefined)
            newMeasurement.value = math.round(last.value, 4)
        }

        return newMeasurement
      })

      return this.$canCreate('datastreams', this.org)
        ? measurements
        : measurements.filter(measurement => !!measurement.datastream)
    }
  }
}

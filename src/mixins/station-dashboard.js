import { mapGetters, mapState } from 'vuex'
import moment from 'moment'
import math from '@/lib/math'
import { pressure } from '@/lib/barometric'
import { newCurrent, newForecast } from '@/lib/dashboard'

export default {
  middleware: [
    'check-org',
    'check-station',
    'dt-unit-vocabulary',
    'soms',
    'system-time-utc'
  ],

  data: () => ({
    current: newCurrent(),
    forecast: newForecast(),

    datastreamsByKey: null,

    id: null,

    photoIndex: 0,

    somId: null,

    seriesFetchWorker: null,
    stationDashboardWorker: null,

    units: null
  }),

  fetch() {
    const { somId } = this.$route.query
    this.somId = somId || 'met'

    const fetchSpec = {
      stationId: this.station._id
    }

    this.stationDashboardWorker.postMessage({
      id: 0,
      fetchSpec
    })
  },

  computed: {
    ...mapGetters(['getUnitText', 'org', 'station']),
    ...mapGetters({
      findSOMs: 'soms/find',
      getTime: 'time/get'
    }),
    ...mapState(['auth']),

    currentTime() {
      return moment.utc(this.getTime('utc').now).valueOf()
    },

    externalLinks() {
      return this.station.external_links || []
    },

    media() {
      return this.station.media || []
    },

    photos() {
      return this.media.filter(media => media.type === 'photo')
    },

    stationTime() {
      return this.currentTime + this.station.utc_offset * 1000
    },

    today() {
      const { stationTime: time } = this

      return {
        startTime: moment.utc(time).startOf('d').valueOf(),
        untilTime: moment.utc(time).startOf('d').add(1, 'd').valueOf()
      }
    },

    twoWeeks() {
      const { stationTime: time } = this

      return {
        startTime: moment.utc(time).startOf('d').subtract(14, 'd').valueOf(),
        untilTime: moment.utc(time).startOf('d').add(1, 'd').valueOf()
      }
    },

    waterYear() {
      const { stationTime: time } = this

      return {
        startTime: moment
          .utc(time)
          .startOf('M')
          .subtract(9, 'M')
          .startOf('y')
          .add(9, 'M')
          .valueOf(),
        untilTime: moment
          .utc(time)
          .startOf('M')
          .subtract(9, 'M')
          .startOf('y')
          .add(9, 'M')
          .add(1, 'y')
          .valueOf()
      }
    },

    yesterday() {
      const { stationTime: time } = this

      return {
        startTime: moment.utc(time).startOf('d').subtract(1, 'd').valueOf(),
        untilTime: moment.utc(time).startOf('d').valueOf()
      }
    }
  },

  watch: {
    somId(newValue, oldValue) {
      if (oldValue !== null) this.loadSeries()
    }
  },

  created() {
    this.seriesFetchWorker = this.$workers.createSeriesFetchWorker()
    this.seriesFetchWorker.postMessage({
      api: this.$api
    })
    // Handle HMR so we can debug
    // SEE: https://webpack.github.io/docs/hot-module-replacement.html
    if (module.hot) {
      this.seriesFetchWorker.removeEventListener(
        'message',
        this.seriesFetchWorkerMessageHandler
      )
    }
    this.seriesFetchWorker.addEventListener(
      'message',
      this.seriesFetchWorkerMessageHandler
    )

    this.stationDashboardWorker = this.$workers.createStationDashboardWorker()
    this.stationDashboardWorker.postMessage({
      accessToken: this.auth.accessToken,
      api: this.$api
    })
    // Handle HMR so we can debug
    // SEE: https://webpack.github.io/docs/hot-module-replacement.html
    if (module.hot) {
      this.stationDashboardWorker.removeEventListener(
        'message',
        this.stationDashboardWorkerMessageHandler
      )
    }
    this.stationDashboardWorker.addEventListener(
      'message',
      this.stationDashboardWorkerMessageHandler
    )
  },

  beforeDestroy() {
    this.seriesFetchWorker.removeEventListener(
      'message',
      this.seriesFetchWorkerMessageHandler
    )
    this.seriesFetchWorker.terminate()
    this.seriesFetchWorker = null

    this.stationDashboardWorker.removeEventListener(
      'message',
      this.stationDashboardWorkerMessageHandler
    )
    this.stationDashboardWorker.terminate()
    this.stationDashboardWorker = null
  },

  methods: {
    fetchAirDirection(id, { startTime, untilTime }, { airDirection }) {
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }

      if (airDirection) {
        fetchSpec.queries.push({
          config: airDirection.general_config_resolved,
          datastream_id: airDirection._id
        })

        this.seriesFetchWorker.postMessage({
          id,
          fetchSpec
        })
      }
    },

    fetchBarometricPressure(
      id,
      { startTime, untilTime },
      { barometricPressure }
    ) {
      const { units } = this
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }

      if (barometricPressure) {
        fetchSpec.queries.push({
          config: barometricPressure.general_config_resolved,
          datastream_id: barometricPressure._id,
          uom_id: units.barometricPressure.uomId
        })

        this.seriesFetchWorker.postMessage({
          id,
          fetchSpec
        })
      }
    },

    fetchCumulativeRainfall(
      id,
      { startTime, untilTime },
      { cumulativePrecipitation }
    ) {
      const { units } = this
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }

      if (cumulativePrecipitation) {
        fetchSpec.queries.push({
          datastream_id: cumulativePrecipitation._id,
          uom_id: units.precipitation.uomId
        })

        this.seriesFetchWorker.postMessage({
          id,
          fetchSpec
        })
      }
    },

    fetchForecast(
      id,
      { startTime },
      {
        nwsConditionsIcon,
        nwsTemperatureMaximum,
        nwsTemperatureMinimum,
        nwsWeather
      }
    ) {
      const { currentTime, station, units } = this

      if (!(station.geo && station.geo.coordinates.length > 1)) return

      const coordinates = station.geo.coordinates
      const fetchSpec = {
        baseQuery: {
          lat: coordinates[1],
          lng: coordinates[0],
          $limit: 20
        },
        queries: [],
        startTime: currentTime,
        timeLocal: false
      }

      if (nwsConditionsIcon)
        fetchSpec.queries.push({
          datastream_id: nwsConditionsIcon._id
        })

      if (nwsTemperatureMaximum)
        fetchSpec.queries.push({
          datastream_id: nwsTemperatureMaximum._id,
          uom_id: units.temperature.uomId
        })

      if (nwsTemperatureMinimum)
        fetchSpec.queries.push({
          datastream_id: nwsTemperatureMinimum._id,
          uom_id: units.temperature.uomId
        })

      if (nwsWeather)
        fetchSpec.queries.push({
          datastream_id: nwsWeather._id
        })

      if (fetchSpec.queries.length)
        this.seriesFetchWorker.postMessage({
          id,
          fetchSpec
        })
    },

    loadSeries() {},

    seriesFetchWorkerMessageHandler(event) {
      const { data } = event
      const { first, id, isFetching, last, query, series } = data
      const { current, datastreamsByKey, forecast, station } = this

      if (id === `${this.id}-airTemperature`) {
        if (isFetching === true) {
          current.airTemperature = null
          current.relativeHumidity = null
          return
        }

        if (!last) return

        if (
          datastreamsByKey.airTemperature &&
          datastreamsByKey.airTemperature._id === query.datastream_id
        ) {
          current.airTemperature = last
          return
        }
        if (
          datastreamsByKey.relativeHumidity &&
          datastreamsByKey.relativeHumidity._id === query.datastream_id
        ) {
          current.relativeHumidity = last
          return
        }
      }

      if (id === `${this.id}-barometricPressure`) {
        if (isFetching === true) {
          current.barometricPressure = null
          return
        }

        if (!last) return

        if (
          datastreamsByKey.barometricPressure &&
          datastreamsByKey.barometricPressure._id === query.datastream_id
        ) {
          if (station.geo && station.geo.coordinates.length > 2) {
            const ele = math
              .unit(pressure(station.geo.coordinates[2]), 'Pa')
              .toNumber('mbar')
            const sea = math.unit(pressure(0), 'Pa').toNumber('mbar')

            current.meanSeaLevelPressure = Object.assign({}, last, {
              value: math.round(last.value + (sea - ele), 4)
            })
          }

          current.barometricPressure = last
          return
        }
      }

      if (id === `${this.id}-batteryVoltage`) {
        if (isFetching === true) {
          current.batteryVoltage = null
          return
        }

        if (!last) return

        if (
          datastreamsByKey.batteryVoltage &&
          datastreamsByKey.batteryVoltage._id === query.datastream_id
        ) {
          current.batteryVoltage = last
          return
        }
      }

      if (id === `${this.id}-rainfallToday`) {
        if (isFetching === true) {
          current.rainfallToday = null
          current.wyPrecipToDate = null
          return
        }

        if (!(first && last)) return

        if (
          datastreamsByKey.cumulativePrecipitation &&
          datastreamsByKey.cumulativePrecipitation._id === query.datastream_id
        ) {
          current.rainfallToday = Object.assign({}, last, {
            value: math.round(last.value - first.value, 4)
          })
          current.wyPrecipToDate = last
          return
        }
      }

      if (id === `${this.id}-rainfallYesterday`) {
        if (isFetching === true) {
          current.rainfallYesterday = null
          return
        }

        if (!(first && last)) return

        if (
          datastreamsByKey.cumulativePrecipitation &&
          datastreamsByKey.cumulativePrecipitation._id === query.datastream_id
        ) {
          current.rainfallYesterday = Object.assign({}, last, {
            value: math.round(last.value - first.value, 4)
          })
          return
        }
      }

      if (id === `${this.id}-solarRadiation`) {
        if (isFetching === true) {
          current.par = null
          current.solarRadiation = null
          return
        }

        if (!last) return

        if (
          datastreamsByKey.par &&
          datastreamsByKey.par._id === query.datastream_id
        ) {
          current.par = last
          return
        }
        if (
          datastreamsByKey.solarRadiation &&
          datastreamsByKey.solarRadiation._id === query.datastream_id
        ) {
          current.solarRadiation = last
          return
        }
      }

      if (id === `${this.id}-windDirection`) {
        if (isFetching === true) {
          current.windDirection = null
          return
        }

        if (!last) return

        if (
          datastreamsByKey.airDirection &&
          datastreamsByKey.airDirection._id === query.datastream_id
        ) {
          current.windDirection = last
        }
      }

      if (id === `${this.id}-windSpeed`) {
        if (isFetching === true) {
          current.windSpeed = null
          return
        }

        if (!last) return

        if (
          datastreamsByKey.airSpeed &&
          datastreamsByKey.airSpeed._id === query.datastream_id
        ) {
          current.windSpeed = last
        }
      }

      if (id === `${this.id}-forecast`) {
        if (isFetching === true) {
          forecast.conditionsIcon = null
          forecast.temperatureMaximum = null
          forecast.temperatureMinimum = null
          forecast.weather = null
          return
        }

        if (!series) return

        if (
          datastreamsByKey.nwsConditionsIcon &&
          datastreamsByKey.nwsConditionsIcon._id === query.datastream_id
        ) {
          forecast.conditionsIcon = series
        }
        if (
          datastreamsByKey.nwsTemperatureMaximum &&
          datastreamsByKey.nwsTemperatureMaximum._id === query.datastream_id
        ) {
          forecast.temperatureMaximum = series
        }
        if (
          datastreamsByKey.nwsTemperatureMinimum &&
          datastreamsByKey.nwsTemperatureMinimum._id === query.datastream_id
        ) {
          forecast.temperatureMinimum = series
        }
        if (
          datastreamsByKey.nwsWeather &&
          datastreamsByKey.nwsWeather._id === query.datastream_id
        ) {
          forecast.weather = series
        }
      }
    },

    stationDashboardWorkerMessageHandler(event) {
      if (!event.data.datastreamsByKey) return

      this.datastreamsByKey = event.data.datastreamsByKey
      this.seriesFetchWorker.postMessage({
        accessToken: this.auth.accessToken
      })

      this.loadSeries()
    }
  }
}

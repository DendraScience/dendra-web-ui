<template>
  <v-container v-if="station && org" fluid pa-0>
    <v-row no-gutters>
      <v-col>
        <v-container>
          <v-row>
            <v-col>
              <h2 class="display-2 font-weight-light mb-2">
                {{ station.name }}
              </h2>

              <h3 v-if="station.description" class="subtitle-2 mb-2">
                {{ station.description }}
              </h3>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-card>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>{{ mdiClockOutline }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        >{{
                          (currentTime + station.utc_offset * 1000) | timeFormat
                        }}
                        {{ station.time_zone }} (UTC
                        {{ station.utc_offset | utcOffsetHours }}
                        hours)</v-list-item-title
                      >
                    </v-list-item-content>
                    <!-- TODO: Implement reload -->
                    <!--
                  <v-list-item-action>
                    <v-icon small>mdi-reload</v-icon>
                  </v-list-item-action>
 -->
                  </v-list-item>

                  <v-list-item v-if="station.geo">
                    <v-list-item-icon>
                      <v-icon>{{ mdiMapMarker }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        >{{ station.geo.coordinates[1] }}&deg;,
                        {{ station.geo.coordinates[0] }}&deg;</v-list-item-title
                      >
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item
                    v-if="station.geo && station.geo.coordinates.length > 2"
                  >
                    <v-list-item-icon>
                      <v-icon>{{ mdiElevationRise }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        >{{
                          station.geo.coordinates[2]
                            | unit('', 'm', somId === 'imp' ? 'ft' : 'm')
                            | round('', 4)
                        }}
                        m</v-list-item-title
                      >
                    </v-list-item-content>
                  </v-list-item>
                </v-list>

                <v-divider />
                <!--
              <v-list>
                <v-list-item class="success" dark two-line>
                  <v-list-item-icon>
                    <v-icon>mdi-check-circle</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Online</v-list-item-title>
                    <v-list-item-subtitle
                      >Data received an hour ago</v-list-item-subtitle
                    >
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon>
                      <v-icon>mdi-chevron-double-down</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
 -->
                <v-list dense>
                  <v-list-item
                    :to="{
                      name: 'orgs-orgSlug-stations-stationId',
                      params: {
                        orgSlug: org.slug,
                        stationId: station._id
                      }
                    }"
                    nuxt
                  >
                    <v-list-item-icon>
                      <v-icon>{{ mdiNature }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Station details</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item
                    v-for="(item, index) in externalLinks"
                    :key="index"
                    :disabled="!item.url"
                    :href="item.url"
                    target="_blank"
                  >
                    <v-list-item-icon>
                      <v-icon>{{ mdiOpenInApp }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card v-if="photos.length > 0" color="grey lighten-4">
                <!-- TODO: Implement zoom -->
                <!--
              <v-btn
                absolute
                color="tertiary"
                dark
                fab
                right
                small
                style="top: 8px;"
                top
              >
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
 -->
                <v-container fluid>
                  <v-row dense>
                    <v-col v-if="photoIndex < photos.length">
                      <v-img
                        :key="photoIndex"
                        :lazy-src="
                          $options.filters.https(
                            photos[photoIndex].sizes.small.url
                          )
                        "
                        :src="
                          $options.filters.https(
                            photos[photoIndex].sizes.large.url
                          )
                        "
                        aspect="1"
                        contain
                        height="320"
                      >
                        <template v-slot:placeholder>
                          <v-row
                            align="center"
                            class="fill-height ma-0"
                            justify="center"
                          >
                            <v-progress-circular
                              color="grey lighten-5"
                              indeterminate
                            ></v-progress-circular>
                          </v-row>
                        </template>
                      </v-img>
                    </v-col>

                    <v-col>
                      <v-slide-group
                        v-model="photoIndex"
                        center-active
                        mandatory
                        show-arrows
                      >
                        <v-slide-item
                          v-for="(photo, index) in photos"
                          :key="index"
                        >
                          <template v-slot:default="{ active, toggle }">
                            <v-card
                              :style="{ opacity: active ? 1 : 0.6 }"
                              class="ma-1"
                              flat
                              tile
                              @click="toggle"
                            >
                              <v-img
                                :src="
                                  $options.filters.https(photo.sizes.small.url)
                                "
                                width="80"
                              />
                            </v-card>
                          </template>
                        </v-slide-item>
                      </v-slide-group>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>

              <v-alert v-else type="info">
                Sorry, no photos.
              </v-alert>
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <current-conditions
                :datastreams-by-key="datastreamsByKey"
                :org="org"
                :units="units"
                :value="current"
              >
                <template v-slot:util>
                  <v-select
                    v-model="somId"
                    :items="findSOMs().data"
                    dense
                    hide-details
                    item-text="name"
                    item-value="_id"
                    label="Units"
                    outlined
                  >
                  </v-select>
                </template>
              </current-conditions>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>

    <v-row v-if="station.geo" no-gutters>
      <v-col>
        <forecast-conditions :units="units" :value="forecast">
          <template v-slot:util>
            <a
              :href="`http://forecast.weather.gov/MapClick.php?lat=${station.geo.coordinates[1]}&lon=${station.geo.coordinates[0]}`"
              target="_blank"
              >Visit NWS site</a
            >
          </template>
        </forecast-conditions>
      </v-col>
    </v-row>

    <v-row v-if="charts.length" no-gutters>
      <v-col>
        <datastream-charts
          :show-remove="false"
          :value="charts"
          :worker="Object.freeze(seriesFetchWorker)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from 'vue'
import vuetifyColors from 'vuetify/lib/util/colors'
import { mapGetters, mapState } from 'vuex'
import moment from 'moment'
import timer from '@/mixins/timer'
import math from '@/lib/math'
import { pressure } from '@/lib/barometric'
import { defaultOptions } from '@/lib/chart'
import { newCurrent, newForecast, unitsData } from '@/lib/dashboard'
import { idRandom } from '@/lib/utils'
import CurrentConditions from '@/components/CurrentConditions'
import DatastreamCharts from '@/components/DatastreamCharts'
import ForecastConditions from '@/components/ForecastConditions'

export default {
  components: {
    CurrentConditions,
    DatastreamCharts,
    ForecastConditions
  },

  middleware: [
    'check-org',
    'check-station',
    'dt-unit-vocabulary',
    'soms',
    'system-time-utc'
  ],

  mixins: [timer],

  data: () => ({
    charts: [],
    current: newCurrent(),
    forecast: newForecast(),

    datastreamsByKey: null,

    id: null,

    photoIndex: 0,

    somId: 'met',

    seriesFetchWorker: null,
    stationDashboardWorker: null,

    timerInterval: 300000,

    units: null
  }),

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
    somId(newValue) {
      this.loadSeries()
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

  mounted() {
    this.fetch()
  },

  methods: {
    addCumulativeRainfallChart(
      id,
      { startTime, untilTime },
      { cumulativePrecipitation }
    ) {
      const { units } = this
      const colors = [
        vuetifyColors.blue.darken3,
        vuetifyColors.blue.base,
        vuetifyColors.blue.lighten3
      ]
      const options = defaultOptions('Cumulative Rainfall', this.station.name)
      const seriesOptions = []
      const fetchSpec = {
        queries: [],
        seriesType: 'waterYear',
        startTime: [],
        untilTime: []
      }
      const { yAxis } = options

      options.chart.resetPointer = true
      options.tooltip.xDateFormat = '%m-%d %H:%M'
      options.xAxis.dateTimeLabelFormats = {
        // Don't display the dummy year
        month: '%e. %b',
        year: '%b'
      }

      const labels = {
        format: `{value} ${units.precipitation.text}`,
        style: {
          color: vuetifyColors.blue.base
        }
      }
      const title = {
        text: null
      }

      yAxis.push({
        labels,
        title
      })
      yAxis.push({
        labels,
        linkedTo: 0,
        opposite: true,
        title
      })

      if (cumulativePrecipitation) {
        const start = moment.utc(startTime)
        const until = moment.utc(untilTime)

        for (let i = 0; i < 3; i++) {
          seriesOptions.push({
            color: colors[i],
            name: `${until.year()} ${cumulativePrecipitation.name} ${
              units.precipitation.text
            }`,
            yAxis: 0
          })
          fetchSpec.queries.push({
            datastream_id: cumulativePrecipitation._id,
            uom_id: units.precipitation.uomId
          })
          fetchSpec.startTime.push(start.valueOf())
          fetchSpec.untilTime.push(until.valueOf())

          start.subtract(1, 'y')
          until.subtract(1, 'y')
        }
      }

      if (seriesOptions.length) {
        this.charts.push({
          alert: null,
          bus: new Vue(),
          canDownload: false,
          id,
          isReady: true,
          options,
          seriesOptions,
          fetchSpec
        })
      }
    },

    addAirTemperatureChart(
      id,
      { startTime, untilTime },
      { airTemperature, airTemperaturesAtHeight, relativeHumidity }
    ) {
      const { units } = this
      const colors = [
        vuetifyColors.cyan.lighten1,
        vuetifyColors.cyan.lighten2,
        vuetifyColors.cyan.lighten3,
        vuetifyColors.cyan.lighten4,
        vuetifyColors.cyan.lighten5
      ]
      const options = defaultOptions('Air Temperature / RH', this.station.name)
      const seriesOptions = []
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }
      const { yAxis } = options

      const title = {
        text: null
      }

      yAxis.push({
        labels: {
          format: `{value} ${units.temperature.text}`,
          style: {
            color: vuetifyColors.cyan.base
          }
        },
        title
      })
      yAxis.push({
        labels: {
          format: `{value} ${units.relativeHumidity.text}`,
          style: {
            color: vuetifyColors.green.base
          }
        },
        opposite: true,
        title
      })

      if (airTemperature) {
        seriesOptions.push({
          color: vuetifyColors.cyan.darken4,
          name: `${airTemperature.name} ${units.temperature.text}`,
          yAxis: 0
        })
        fetchSpec.queries.push({
          datastream_id: airTemperature._id,
          uom_id: units.temperature.uomId
        })
      }

      airTemperaturesAtHeight.forEach(({ _id, name }, i) => {
        seriesOptions.push({
          color: colors[i],
          name: `${name} ${units.temperature.text}`,
          yAxis: 0
        })
        fetchSpec.queries.push({
          datastream_id: _id,
          uom_id: units.temperature.uomId
        })
      })

      if (relativeHumidity) {
        seriesOptions.push({
          color: vuetifyColors.green.base,
          name: `${relativeHumidity.name} ${units.relativeHumidity.text}`,
          yAxis: 1
        })
        fetchSpec.queries.push({
          datastream_id: relativeHumidity._id
        })
      }

      if (seriesOptions.length) {
        this.charts.push({
          alert: null,
          bus: new Vue(),
          canDownload: false,
          fetchSpec,
          group: 1,
          id,
          isReady: true,
          options,
          seriesOptions,
          sync: true
        })
      }
    },

    addBatteryVoltageChart(id, { startTime, untilTime }, { batteryVoltage }) {
      const { units } = this
      const options = defaultOptions('Battery Voltage', this.station.name)
      const seriesOptions = []
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }
      const { yAxis } = options

      const labels = {
        format: `{value} ${units.batteryVoltage.text}`,
        style: {
          color: vuetifyColors.grey.base
        }
      }
      const title = {
        text: null
      }

      yAxis.push({
        labels,
        title
      })
      yAxis.push({
        labels,
        linkedTo: 0,
        opposite: true,
        title
      })

      if (batteryVoltage) {
        seriesOptions.push({
          color: vuetifyColors.grey.base,
          name: `${batteryVoltage.name} ${units.batteryVoltage.text}`,
          yAxis: 0
        })
        fetchSpec.queries.push({
          datastream_id: batteryVoltage._id
        })
      }

      if (seriesOptions.length) {
        this.charts.push({
          alert: null,
          bus: new Vue(),
          canDownload: false,
          fetchSpec,
          group: 1,
          id,
          isReady: true,
          options,
          seriesOptions,
          sync: true
        })
      }
    },

    addSoilTemperatureChart(
      id,
      { startTime, untilTime },
      { soilTemperaturesAtDepth }
    ) {
      const { units } = this
      const colors = [
        vuetifyColors.yellow.darken2,
        vuetifyColors.lime.darken2,
        vuetifyColors.lime.darken4,
        vuetifyColors.brown.base,
        vuetifyColors.brown.darken2,
        vuetifyColors.brown.darken4,
        vuetifyColors.grey.darken4,
        vuetifyColors.black
      ]
      const options = defaultOptions('Soil Temperature', this.station.name)
      const seriesOptions = []
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }
      const { yAxis } = options

      const labels = {
        format: `{value} ${units.temperature.text}`,
        style: {
          color: vuetifyColors.brown.base
        }
      }
      const title = {
        text: null
      }

      yAxis.push({
        labels,
        title
      })
      yAxis.push({
        labels,
        linkedTo: 0,
        opposite: true,
        title
      })

      soilTemperaturesAtDepth.forEach(({ _id, name }, i) => {
        seriesOptions.push({
          color: colors[i],
          name: `${name} ${units.temperature.text}`,
          yAxis: 0
        })
        fetchSpec.queries.push({
          datastream_id: _id,
          uom_id: units.temperature.uomId
        })
      })

      if (seriesOptions.length) {
        this.charts.push({
          alert: null,
          bus: new Vue(),
          canDownload: false,
          fetchSpec,
          group: 1,
          id,
          isReady: true,
          options,
          seriesOptions,
          sync: true
        })
      }
    },

    addSolarRadiationChart(
      id,
      { startTime, untilTime },
      { par, solarRadiation }
    ) {
      const { units } = this
      const options = defaultOptions('Solar Radiation', this.station.name)
      const seriesOptions = []
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }
      const { yAxis } = options

      const title = {
        text: null
      }

      yAxis.push({
        labels: {
          format: `{value} ${units.solarRadiation.text}`,
          style: {
            color: vuetifyColors.orange.base
          }
        },
        title
      })
      yAxis.push({
        labels: {
          format: `{value} ${units.par.text}`,
          style: {
            color: vuetifyColors.lightGreen.base
          }
        },
        opposite: true,
        title
      })

      if (solarRadiation) {
        seriesOptions.push({
          color: vuetifyColors.orange.base,
          name: `${solarRadiation.name} ${units.solarRadiation.text}`,
          yAxis: 0
        })
        fetchSpec.queries.push({
          datastream_id: solarRadiation._id,
          uom_id: units.solarRadiation.uomId
        })
      }

      if (par) {
        seriesOptions.push({
          color: vuetifyColors.lightGreen.base,
          name: `${par.name} ${units.par.text}`,
          yAxis: 1
        })
        fetchSpec.queries.push({
          datastream_id: par._id,
          uom_id: units.par.uomId
        })
      }

      if (seriesOptions.length) {
        this.charts.push({
          alert: null,
          bus: new Vue(),
          canDownload: false,
          fetchSpec,
          group: 1,
          id,
          isReady: true,
          options,
          seriesOptions,
          sync: true
        })
      }
    },

    addWindSpeedChart(
      id,
      { startTime, untilTime },
      { airSpeedAverage, airSpeedMaximum }
    ) {
      const { units } = this
      const options = defaultOptions('Wind Speed', this.station.name)
      const seriesOptions = []
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }
      const { yAxis } = options

      const labels = {
        format: `{value} ${units.speed.text}`,
        style: {
          color: vuetifyColors.purple.base
        }
      }
      const title = {
        text: null
      }

      yAxis.push({
        labels,
        title
      })
      yAxis.push({
        labels,
        linkedTo: 0,
        opposite: true,
        title
      })

      if (airSpeedAverage) {
        seriesOptions.push({
          color: vuetifyColors.purple.base,
          name: `${airSpeedAverage.name} ${units.speed.text}`,
          yAxis: 0,
          zIndex: 2
        })
        fetchSpec.queries.push({
          datastream_id: airSpeedAverage._id,
          uom_id: units.speed.uomId
        })
      }

      if (airSpeedMaximum) {
        seriesOptions.push({
          color: vuetifyColors.red.lighten2,
          name: `${airSpeedMaximum.name} ${units.speed.text}`,
          yAxis: 0,
          zIndex: 1
        })
        fetchSpec.queries.push({
          datastream_id: airSpeedMaximum._id,
          uom_id: units.speed.uomId
        })
      }

      if (seriesOptions.length) {
        this.charts.push({
          alert: null,
          bus: new Vue(),
          canDownload: false,
          fetchSpec,
          group: 1,
          id,
          isReady: true,
          options,
          seriesOptions,
          sync: true
        })
      }
    },

    fetch() {
      const fetchSpec = {
        stationId: this.station._id
      }

      this.stationDashboardWorker.postMessage({
        id: 0,
        fetchSpec
      })
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

      if (fetchSpec.queries.length) {
        this.seriesFetchWorker.postMessage({
          id,
          fetchSpec
        })
      }
    },

    loadSeries() {
      const id = (this.id = `stationDashboard-${new Date().getTime()}-${idRandom()}`)
      const { datastreamsByKey, today, twoWeeks, waterYear, yesterday } = this

      this.units = unitsData[this.somId](this.getUnitText)
      this.charts = []
      this.current = newCurrent()

      this.addCumulativeRainfallChart(
        `${id}-cumulativeRainfall`,
        waterYear,
        datastreamsByKey
      )
      this.addBatteryVoltageChart(
        `${id}-batteryVoltage`,
        twoWeeks,
        datastreamsByKey
      )
      this.addAirTemperatureChart(
        `${id}-airTemperature`,
        twoWeeks,
        datastreamsByKey
      )
      this.addSoilTemperatureChart(
        `${id}-soilTemperature`,
        twoWeeks,
        datastreamsByKey
      )
      this.addWindSpeedChart(`${id}-windSpeed`, twoWeeks, datastreamsByKey)
      this.addSolarRadiationChart(
        `${id}-solarRadiation`,
        twoWeeks,
        datastreamsByKey
      )

      this.fetchBarometricPressure(
        `${id}-barometricPressure`,
        today,
        datastreamsByKey
      )
      this.fetchCumulativeRainfall(
        `${id}-rainfallToday`,
        today,
        datastreamsByKey
      )
      this.fetchCumulativeRainfall(
        `${id}-rainfallYesterday`,
        yesterday,
        datastreamsByKey
      )
      this.fetchForecast(`${id}-forecast`, today, datastreamsByKey)
    },

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

      if (id === `${this.id}-windSpeed`) {
        if (isFetching === true) {
          current.windSpeed = null
          return
        }

        if (!last) return

        if (
          datastreamsByKey.airSpeedAverage &&
          datastreamsByKey.airSpeedAverage._id === query.datastream_id
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
</script>

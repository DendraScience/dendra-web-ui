<template>
  <v-card
    v-resize="resized"
    :dark="options.includes('dark')"
    :height="innerHeight"
    :width="innerWidth"
    :outlined="options.includes('outlined')"
    tile
  >
    <v-img
      :height="imageHeight"
      :src="
        photos.length &&
        photos[0].sizes.large &&
        $options.filters.https(photos[0].sizes.large.url)
      "
      aspect-ratio="1"
      class="align-end"
      width="100%"
    >
      <template v-slot:placeholder>
        <v-sheet color="green darken-4" height="100%" width="100%"></v-sheet>
      </template>

      <v-card v-if="!imageDrawer" color="rgba(0, 0, 0, 0.5)" dark tile>
        <v-card-title>{{ station.name }}</v-card-title>

        <station-time-geo-list
          :currentTime="currentTime"
          :getUnitText="getUnitText"
          :som-id="somId"
          :value="station"
          color="transparent"
        />
      </v-card>
    </v-img>

    <v-btn
      v-if="photos.length"
      color="grey darken-1"
      dark
      fab
      fixed
      right
      small
      top
      @click="imageDrawer = !imageDrawer"
    >
      <v-icon>{{ imageDrawer ? mdiChevronUp : mdiChevronDown }}</v-icon>
    </v-btn>

    <current-conditions
      :datastreams-by-key="datastreamsByKey"
      :height="tableHeight"
      :org="org"
      :show-last-seen="options.includes('lastSeen')"
      :units="units"
      :value="current"
    />

    <v-divider />

    <v-card-actions>
      <v-btn small> Forecast</v-btn>
      <!-- <v-btn small text> 2 Week</v-btn> -->
      <v-spacer />

      <v-btn class="mr-1" outlined small text>Explore Data</v-btn>

      <v-menu>
        <template v-slot:activator="{ on, attrs }">
          <v-btn outlined small text v-bind="attrs" v-on="on">Units</v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="item in findSOMs().data"
            :key="item._id"
            @click="somId = item._id"
          >
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>

    <v-card-text class="py-1 caption grey">
      <a
        class="font-weight-medium white--text"
        href="https://dendra.science/"
        target="_blank"
        >Data hosted on Dendra.Science</a
      >
    </v-card-text>
  </v-card>
</template>

<script>
import { pressure } from '@/lib/barometric'
import { newCurrent, newForecast, unitsData } from '@/lib/dashboard'
import { idRandom } from '@/lib/utils'
import routeQuery from '@/mixins/route-query'
import stationDashboard from '@/mixins/station-dashboard'
import CurrentConditions from '@/components/WidgetCurrentConditions'
import StationTimeGeoList from '@/components/StationTimeGeoList'

export default {
  components: {
    CurrentConditions,
    StationTimeGeoList
  },

  layout: 'widget',

  mixins: [routeQuery, stationDashboard],

  data: () => ({
    actionsHeight: 75,
    cardHeight: null,
    imageDrawer: false,
    innerHeight: null,
    innerWidth: null
  }),

  computed: {
    imageHeight() {
      return this.imageDrawer
        ? Math.min(this.innerWidth, this.innerHeight * 0.6)
        : 200
    },

    options() {
      return `${this.$route.query.options}`.split(',')
    },

    tableHeight() {
      return this.innerHeight - this.imageHeight - this.actionsHeight
    }
  },

  mounted() {},

  methods: {
    fetchAirSpeed(id, { startTime, untilTime }, { airSpeed }) {
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }

      if (airSpeed) {
        fetchSpec.queries.push({
          config: airSpeed.general_config_resolved,
          datastream_id: airSpeed._id
        })

        this.seriesFetchWorker.postMessage({
          id,
          fetchSpec
        })
      }
    },

    fetchAirTemperature(
      id,
      { startTime, untilTime },
      { airTemperature, relativeHumidity }
    ) {
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }

      if (airTemperature)
        fetchSpec.queries.push({
          config: airTemperature.general_config_resolved,
          datastream_id: airTemperature._id
        })

      if (relativeHumidity)
        fetchSpec.queries.push({
          config: relativeHumidity.general_config_resolved,
          datastream_id: relativeHumidity._id
        })

      if (fetchSpec.queries.length)
        this.seriesFetchWorker.postMessage({
          id,
          fetchSpec
        })
    },

    fetchBatteryVoltage(id, { startTime, untilTime }, { batteryVoltage }) {
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }

      if (batteryVoltage) {
        fetchSpec.queries.push({
          config: batteryVoltage.general_config_resolved,
          datastream_id: batteryVoltage._id
        })

        this.seriesFetchWorker.postMessage({
          id,
          fetchSpec
        })
      }
    },

    fetchSolarRadiation(id, { startTime, untilTime }, { par, solarRadiation }) {
      const fetchSpec = {
        queries: [],
        startTime,
        untilTime
      }

      if (par)
        fetchSpec.queries.push({
          config: par.general_config_resolved,
          datastream_id: par._id
        })

      if (solarRadiation)
        fetchSpec.queries.push({
          config: solarRadiation.general_config_resolved,
          datastream_id: solarRadiation._id
        })

      if (fetchSpec.queries.length)
        this.seriesFetchWorker.postMessage({
          id,
          fetchSpec
        })
    },

    loadSeries() {
      const id =
        (this.id = `stationWidget-${new Date().getTime()}-${idRandom()}`)
      const { datastreamsByKey, today, yesterday } = this

      this.units = unitsData[this.somId](this.getUnitText)
      this.current = newCurrent()

      this.fetchAirDirection(`${id}-windDirection`, today, datastreamsByKey)
      this.fetchAirSpeed(`${id}-windSpeed`, today, datastreamsByKey)
      this.fetchAirTemperature(`${id}-airTemperature`, today, datastreamsByKey)
      this.fetchBarometricPressure(
        `${id}-barometricPressure`,
        today,
        datastreamsByKey
      )
      this.fetchBatteryVoltage(`${id}-batteryVoltage`, today, datastreamsByKey)
      this.fetchSolarRadiation(`${id}-solarRadiation`, today, datastreamsByKey)
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

    resized() {
      this.innerHeight = Math.max(window.innerHeight, 400)
      this.innerWidth = window.innerWidth
    }
  }
}
</script>

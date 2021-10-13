<template>
  <v-card
    v-resize="resized"
    :dark="flags.dark"
    :height="innerHeight"
    :width="innerWidth"
    :outlined="flags.outlined"
    tile
  >
    <v-img
      :height="imageHeight"
      :src="
        flags.photoBackground &&
        photos.length &&
        photos[0].sizes.large &&
        $options.filters.https(photos[0].sizes.large.url)
      "
      aspect-ratio="1"
      class="align-end"
      width="100%"
    >
      <template #placeholder>
        <v-sheet color="grey" height="100%" width="100%"></v-sheet>
      </template>

      <v-card v-if="!photoDrawer" color="rgba(0, 0, 0, 0.5)" dark tile>
        <v-card-title>{{ station.name }}</v-card-title>

        <station-time-geo-list
          v-if="flags.timeGeo"
          :current-time="currentTime"
          :get-unit-text="getUnitText"
          :som-id="somId"
          :value="station"
          color="transparent"
        />
      </v-card>
    </v-img>

    <v-btn
      v-if="flags.photoBackground && flags.photoDrawer && photos.length"
      color="grey darken-1"
      dark
      fab
      fixed
      right
      small
      top
      @click="photoDrawer = !photoDrawer"
    >
      <v-icon>{{ photoDrawer ? mdiChevronUp : mdiChevronDown }}</v-icon>
    </v-btn>

    <v-card-text v-if="!includedDisplayItems[displayIndex]">
      Nothing to show
    </v-card-text>

    <current-conditions
      v-else-if="includedDisplayItems[displayIndex].key === 'current'"
      :datastreams-by-key="datastreamsByKey"
      :height="tableHeight"
      :org="org"
      :show-last-seen="flags.lastSeen"
      :units="units"
      :value="current"
    />

    <forecast-conditions
      v-else-if="includedDisplayItems[displayIndex].key === 'forecast'"
      :height="tableHeight"
      :units="units"
      :value="forecast"
    >
      <template #util>
        <a
          :href="`http://forecast.weather.gov/MapClick.php?lat=${station.geo.coordinates[1]}&lon=${station.geo.coordinates[0]}`"
          class="font-weight-regular"
          target="_blank"
          >Visit NWS site</a
        >
      </template>
    </forecast-conditions>

    <v-divider />

    <v-card-actions>
      <v-btn
        v-if="flags.exploreData"
        :href="datastreamsURL"
        class="mr-1"
        small
        target="_blank"
        >Explore Data</v-btn
      >
      <v-menu>
        <template #activator="{ on, attrs }">
          <v-btn small v-bind="attrs" v-on="on">Units</v-btn>
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

      <v-spacer />

      <v-btn
        v-if="includedDisplayItems.length > 1"
        small
        @click="
          displayIndex = ++displayIndex % includedDisplayItems.length
          photoDrawer = false
        "
        >{{
          includedDisplayItems[(displayIndex + 1) % includedDisplayItems.length]
            .action
        }}</v-btn
      >
    </v-card-actions>

    <v-chip
      :href="statusURL"
      class="ml-2 font-weight-medium"
      color="grey darken-1"
      dark
      target="_blank"
      x-small
      >Data hosted on Dendra.Science
    </v-chip>
  </v-card>
</template>

<script>
import { newCurrent, unitsData } from '@/lib/dashboard'
import { idRandom, queryIs } from '@/lib/utils'
import routeQuery from '@/mixins/route-query'
import stationDashboard from '@/mixins/station-dashboard'
import CurrentConditions from '@/components/WidgetCurrentConditions'
import ForecastConditions from '@/components/WidgetForecastConditions'
import StationTimeGeoList from '@/components/StationTimeGeoList'

export default {
  components: {
    CurrentConditions,
    ForecastConditions,
    StationTimeGeoList
  },

  mixins: [routeQuery, stationDashboard],

  layout: 'widget',

  data: () => ({
    defaultFlags: {
      dark: false,
      exploreData: true,
      lastSeen: false,
      outlined: true,
      photoBackground: true,
      photoDrawer: true,
      timeGeo: true,
      track: true
    },

    displayIndex: 0,
    displayItems: [
      { action: 'View Current', default: true, key: 'current' },
      { action: 'View Forecast', default: true, key: 'forecast' }
    ],

    footerHeight: 80,
    innerHeight: null,
    innerWidth: null,

    photoDrawer: false
  }),

  computed: {
    datastreamsURL() {
      return `${process.env.webSiteURL}/orgs/${this.org.slug}/datastreams?faceted=true&scheme=dq&selectStationId=${this.station._id}`
    },

    flags() {
      const { defaultFlags } = this
      const { query } = this.$route

      return Object.keys(defaultFlags).reduce((accum, key) => {
        const defaultValue = defaultFlags[key]
        const queryValue = queryIs(query[key])
        accum[key] = queryValue === null ? defaultValue : queryValue
        return accum
      }, {})
    },

    imageHeight() {
      return this.photoDrawer
        ? Math.min(this.innerWidth, this.innerHeight * 0.6)
        : this.flags.timeGeo
        ? 200
        : 64
    },

    includedDisplayItems() {
      const { displayItems } = this
      const { query } = this.$route
      const keys =
        typeof query.include === 'string' ? query.include.split(',') : []
      const items = displayItems.filter(item => keys.includes(item.key))

      return items.length ? items : displayItems.filter(item => item.default)
    },

    statusURL() {
      return `${process.env.webSiteURL}/orgs/${this.org.slug}/status/${this.station.slug}`
    },

    tableHeight() {
      return this.innerHeight - this.imageHeight - this.footerHeight
    }
  },

  mounted() {
    const route = this.$route
    let path = route.path

    // Follow SPA best practices -- virtual pageviews
    // SEE: https://developers.google.com/analytics/devguides/collection/gtagjs/single-page-applications
    path = `${path}/orgs/${this.org.slug}/stations/${this.station.slug}`

    if (this.flags.track) this.$tracker.pageView({ name: route.name, path })
  },

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

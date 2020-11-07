<template>
  <div
    v-if="org"
    style="position: relative; height: calc(100vh - 64px); overflow: hidden"
  >
    <div
      class="pa-2"
      style="position: absolute; top: 0; width: 380px; z-index: 2"
    >
      <v-card raised>
        <v-text-field
          v-model.trim="stationsSearchDebounce"
          :append-icon="mdiMagnify"
          clearable
          flat
          hide-details
          label="Search for a station"
          solo
        ></v-text-field>

        <v-btn-toggle v-model="viewToggle" class="pa-2" mandatory>
          <v-btn small text>
            <v-icon small>{{ mdiViewList }}</v-icon>
          </v-btn>
          <v-btn small text>
            <v-icon small>{{ mdiViewAgenda }}</v-icon>
          </v-btn>
          <v-btn small text>
            <v-icon small>{{ mdiArrowExpandAll }}</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-card>
    </div>

    <feathers-vuex-find
      :fetch-query="stationsFetchQuery"
      :query="stationsQuery"
      :watch="['fetchQuery.$and']"
      qid="search"
      service="stations"
    >
      <template v-slot="{ items: stations }">
        <div style="width: 100%; height: 100%">
          <v-navigation-drawer
            :value="viewToggle !== 2"
            class="elevation-2"
            stateless
            style="position: absolute; top: 0; z-index: 1"
            width="380"
          >
            <v-expansion-panels
              v-model="stationsPanel"
              :multiple="stationsMultiple"
              accordion
              style="margin-top: 120px"
            >
              <worker-fetch
                v-for="station in stations"
                :id="station._id"
                :key="station._id"
                :bus="bus"
                :fetch-spec="{ startTime, stationId: station._id }"
                :worker="Object.freeze(stationStatusWorker)"
                @data="stationStatusData"
              >
                <template v-slot="{ result }">
                  <v-expansion-panel
                    v-show="shownStationIds.includes(station._id)"
                    @click="selectMarker(viewToggle === 0 ? station : null)"
                  >
                    <v-expansion-panel-header>
                      <template v-slot:actions>
                        <hc-sparkline
                          :id="station._id"
                          :series-options="Object.freeze(seriesOptions)"
                          :worker="Object.freeze(stationStatusWorker)"
                        />
                      </template>

                      <div>
                        <station-status-icon
                          :station="station"
                          :value="statusById[station._id]"
                          class="mr-1"
                        />

                        <a
                          v-if="
                            linksToOldDashboard &&
                            station.general_config_resolved &&
                            station.general_config_resolved
                              .station_status_links_to_old_dashboard
                          "
                          :href="
                            'https://' +
                            org.slug +
                            '.dendra.science/#/stations/' +
                            station.slug
                          "
                          class="black--text station-link"
                          target="_blank"
                          @click="$event.stopImmediatePropagation()"
                          >{{ station.name }}</a
                        >
                        <nuxt-link
                          v-else
                          :to="{
                            name: 'orgs-orgSlug-status-stationSlug',
                            params: {
                              orgSlug: org.slug,
                              stationSlug: station.slug
                            }
                          }"
                          class="black--text station-link"
                          @click.native="$event.stopImmediatePropagation()"
                          >{{ station.name }}</nuxt-link
                        >
                      </div>
                    </v-expansion-panel-header>

                    <v-expansion-panel-content>
                      <v-row dense>
                        <v-col>
                          <v-card flat>
                            <v-card-subtitle>
                              <h4 class="subtitle-2">
                                Last seen:
                                <span class="font-weight-regular">
                                  {{
                                    result.lastSeenTime
                                      | dateTimeFormatLocal('(no data)')
                                  }}</span
                                >
                              </h4>
                            </v-card-subtitle>

                            <v-card-actions>
                              <v-btn
                                :to="{
                                  name: 'orgs-orgSlug-stations-stationId',
                                  params: {
                                    orgSlug: org.slug,
                                    stationId: station._id
                                  }
                                }"
                                color="primary"
                                exact
                                nuxt
                                small
                                text
                                >Details</v-btn
                              >

                              <v-btn
                                :to="{
                                  name: 'orgs-orgSlug-datastreams',
                                  params: {
                                    orgSlug: org.slug
                                  },
                                  query: {
                                    stationId: station._id
                                  }
                                }"
                                color="primary"
                                exact
                                nuxt
                                small
                                text
                                >Datastreams</v-btn
                              >
                            </v-card-actions>
                          </v-card>
                        </v-col>

                        <v-col
                          v-if="station.media && station.media[0]"
                          cols="auto"
                        >
                          <v-img
                            :src="
                              $options.filters.https(
                                station.media[0].sizes.small.url
                              )
                            "
                            width="90"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </template>
              </worker-fetch>
            </v-expansion-panels>
          </v-navigation-drawer>

          <google-map
            :filter-keys="shownStationIds"
            :icons="icons"
            :info-content="infoContent"
            :info-open="infoOpen"
            :locations-data="statusById"
            :locations="stations"
            :map-options="{}"
            auto-fit
            auto-zoom
            location-key="_id"
            location-lat="geo.coordinates[1]"
            location-lng="geo.coordinates[0]"
            location-title="name"
            style="width: 100%; height: 100%"
            @select-marker="selectMarker"
          />
        </div>
      </template>
    </feathers-vuex-find>
  </div>
</template>

<script>
import Vue from 'vue'
import vuetifyColors from 'vuetify/lib/util/colors'
import { mapActions, mapGetters, mapState } from 'vuex'
import moment from 'moment'
import _debounce from 'lodash/debounce'
import _union from 'lodash/union'
import timer from '@/mixins/timer'
import GoogleMap from '@/components/GoogleMap'
import HcSparkline from '@/components/HcSparkline'
import StationStatusIcon from '@/components/StationStatusIcon'
import WorkerFetch from '@/components/WorkerFetch'
import { dateTimeFormatLocal } from '@/lib/date'
import { escapeRegExp } from '@/lib/utils'

const DEFAULT_THRESHOLD = 120

export default {
  components: {
    GoogleMap,
    HcSparkline,
    StationStatusIcon,
    WorkerFetch
  },

  middleware: ['check-org', 'system-time-utc'],

  mixins: [timer],

  data() {
    return {
      bus: new Vue(),

      infoContent: null,
      infoOpen: null,

      linksToOldDashboard: process.env.linksToOldDashboard,

      stationsMultiple: false,
      stationsPanel: [],
      stationsPanelOpen: [],
      stationsSearch: null,
      stationsSearchDebounce: null,
      stationStatusWorker: null,

      queryStationIds: [],
      shownStationIds: [],

      // TODO: Implement later
      // selectedOrgIds: null,

      seriesOptions: [
        {
          color: vuetifyColors.grey.base,
          name: 'Battery Voltage'
        }
      ],

      statusById: {},

      timerInterval: 300000,

      viewToggle: 0
    }
  },

  computed: {
    ...mapGetters(['org']),
    ...mapGetters({
      getStation: 'stations/get',
      getTime: 'time/get'
    }),
    ...mapState(['auth']),

    icons() {
      return {
        default: {
          anchor: { x: 8, y: 20 },
          fillColor: vuetifyColors.blueGrey.darken2,
          fillOpacity: 1,
          path: this.mdiMapMarkerQuestion,
          scale: 2,
          strokeColor: 'white',
          strokeOpacity: 0.5,
          strokeWeight: 1
        },

        offline: {
          anchor: { x: 8, y: 20 },
          fillColor: vuetifyColors.deepOrange.darken3,
          fillOpacity: 1,
          path: this.mdiMapMarkerAlert,
          scale: 2,
          strokeColor: 'white',
          strokeOpacity: 0.5,
          strokeWeight: 1
        },

        online: {
          anchor: { x: 8, y: 20 },
          fillColor: vuetifyColors.green.darken1,
          fillOpacity: 1,
          path: this.mdiMapMarkerCheck,
          scale: 2,
          strokeColor: 'white',
          strokeOpacity: 0.5,
          strokeWeight: 1
        }
      }
    },

    startTime() {
      return moment.utc(this.getTime('utc').now).subtract(48, 'h').valueOf()
    },

    stationsFetchQuery() {
      // TODO: Implement later
      // const { stationsSearch, selectedOrgIds } = this
      const { stationsSearch } = this

      const query = {
        is_active: true,
        is_enabled: true,
        is_hidden: false,
        // TODO: Remove later
        organization_id: this.org._id,
        station_type: 'weather',
        $limit: 2000, // TODO: Deal with this
        $select: [
          '_id',
          'general_config_resolved',
          'geo',
          'media',
          'name',
          'organization_id',
          'slug'
        ],
        $sort: { name: 1, _id: 1 }
      }

      // TODO: Implement later
      // if (selectedOrgIds && selectedOrgIds.length)
      //   query.organization_id = { $in: selectedOrgIds }

      const ands = []

      if (stationsSearch && stationsSearch.length) {
        // TODO: Implement n-grams for partial full-text search! https://en.wikipedia.org/wiki/N-gram
        ands.push({
          $or: [
            {
              name: {
                $regex: `^${escapeRegExp(stationsSearch)}`,
                $options: 'i'
              }
            },
            {
              $text: { $search: `${stationsSearch}` }
            }
          ]
        })
      }

      if (ands.length) query.$and = ands

      return query
    },

    stationsPaginationSearch() {
      return this.$store.state.stations.pagination.search
    },

    stationsQuery() {
      return {
        _id: { $in: this.queryStationIds },
        $sort: { name: 1, _id: 1 }
      }
    }
  },

  watch: {
    queryStationIds(newValue) {
      this.stationsPanelOpen = Array.from(
        { length: newValue.length },
        (v, k) => k
      )
    },

    stationsPaginationSearch(newValue) {
      this.queryStationIds = _union(
        this.queryStationIds,
        newValue && newValue.ids
      )
      this.shownStationIds = (newValue && newValue.ids) || []
    },

    // TODO:
    // stationsPanel(newValue) {
    //   if (typeof newValue === 'number')
    // },

    stationsSearchDebounce(newValue) {
      this.debouncedStationsSearch(newValue)
    },

    viewToggle(newValue) {
      if (newValue === 0) {
        this.stationsMultiple = false
        this.stationsPanel = []
      } else if (newValue === 1) {
        this.stationsMultiple = true
        this.$nextTick(() => {
          // HACK: stationsExpand needs to be set first
          this.stationsPanel = this.stationsPanelOpen.slice()
        })
      }
    }
  },

  created() {
    // const { query } = this.$route

    // TODO: Implement later
    // if (query && query.orgId) this.selectedOrgIds = [query.orgId]

    this.debouncedStationsSearch = _debounce(value => {
      this.stationsSearch = value
    }, 400)

    this.stationStatusWorker = this.$workers.createStationStatusWorker()
    this.stationStatusWorker.postMessage({
      accessToken: this.auth.accessToken,
      api: this.$api
    })
  },

  beforeDestroy() {
    this.debouncedStationsSearch.cancel()
    this.debouncedStationsSearch = null

    this.stationStatusWorker.terminate()
    this.stationStatusWorker = null
  },

  methods: {
    ...mapActions(['getSystemTimeUTC']),

    selectMarker(station) {
      const { statusById } = this

      if (!station) return

      const coords = station.geo.coordinates
      const link = this.$router.resolve({
        name: 'orgs-orgSlug-status-stationSlug',
        params: {
          orgSlug: this.org.slug,
          stationSlug: station.slug
        }
      })
      const status = statusById[station._id]

      this.infoContent =
        `<h3 class="title">${station.name}</h3>` +
        `<div class="body-1">` +
        (status
          ? `Last seen: ${dateTimeFormatLocal(status.lastSeenTime)}<br />`
          : '') +
        `<a href="${link.href}">Dashboard</a> | ` +
        `<a href="https://www.google.com/maps?q=${coords[1]},${coords[0]}" target="_blank">Google</a></div>`
      this.infoOpen = station._id
    },

    stationStatusData(data) {
      const { id, result } = data

      if (!(id && result && result.lastSeenTime)) return

      const station = this.getStation(id)
      const threshold =
        ((station.general_config_resolved &&
          station.general_config_resolved.station_offline_threshold) ||
          DEFAULT_THRESHOLD) | 0
      const currentTime = moment.utc(this.getTime('utc').now).valueOf()
      const { lastSeenTime } = result
      const isOnline = currentTime - lastSeenTime <= threshold * 60000

      this.$set(this.statusById, id, {
        currentTime,
        lastSeenTime,
        icon: isOnline ? 'online' : 'offline',
        isOnline
      })
    },

    async timerCallback() {
      await this.getSystemTimeUTC()

      this.statusById = {}

      this.bus.$emit('fetch')
    }
  }
}
</script>

<style scoped>
.station-link {
  text-decoration: none;
}
.station-link:hover {
  text-decoration: underline;
}
</style>

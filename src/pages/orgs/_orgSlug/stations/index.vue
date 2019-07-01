<template>
  <div
    v-if="org"
    style="position: relative; height: calc(100vh - 64px); overflow: hidden;"
  >
    <div
      class="pa-2"
      style="position: absolute; top: 0; width: 400px; z-index: 2;"
    >
      <v-card elevation="2">
        <v-text-field
          v-model.trim="stationsSearchDebounce"
          append-icon="search"
          clearable
          full-width
          hide-details
          label="Search for a station"
          single-line
        ></v-text-field>

        <v-card-actions>
          <v-btn-toggle v-model="viewToggle" mandatory>
            <v-btn flat>
              <v-icon>view_list</v-icon>
            </v-btn>
            <v-btn flat>
              <v-icon>view_agenda</v-icon>
            </v-btn>
            <v-btn flat>
              <v-icon>zoom_out_map</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-card-actions>
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
        <div style="width: 100%; height: 100%;">
          <v-navigation-drawer
            :value="viewToggle !== 2"
            class="elevation-8"
            stateless
            style="position: absolute; top: 0; z-index: 1;"
            width="400"
          >
            <v-expansion-panel
              v-model="stationsPanel"
              :expand="stationsExpand"
              style="margin-top: 120px;"
            >
              <worker-fetch
                v-for="station in stations"
                :id="station._id"
                :key="station._id"
                :fetch-spec="{ startTime, stationId: station._id }"
                :worker="Object.freeze(statFetchWorker)"
              >
                <template v-slot="{ result }">
                  <v-expansion-panel-content
                    v-show="shownStationIds.includes(station._id)"
                  >
                    <template v-slot:actions>
                      <hc-sparkline
                        :id="station._id"
                        :series-options="Object.freeze(seriesOptions)"
                        :worker="Object.freeze(statFetchWorker)"
                      />
                    </template>

                    <template v-slot:header>
                      <div>
                        <station-status-icon
                          :current-time="currentTime"
                          :last-seen-time="result.lastSeenTime"
                          :station="station"
                          class="mr-1"
                        />

                        <a
                          :href="
                            'https://' +
                              org.slug +
                              '.dendra.science/#/stations/' +
                              station.slug
                          "
                          class="black--text station-link"
                          target="_blank"
                          >{{ station.name }}</a
                        >
                      </div>
                    </template>

                    <v-layout align-end row>
                      <v-flex grow pl-2>
                        <v-card flat>
                          <v-card-text>
                            Last seen:
                            {{
                              result.lastSeenTime
                                | moment('(no data)', ['format', 'lll'])
                            }}
                          </v-card-text>

                          <v-card-actions>
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
                              flat
                              nuxt
                              small
                              >Datastreams</v-btn
                            >
                          </v-card-actions>
                        </v-card>
                      </v-flex>

                      <v-flex
                        v-if="station.media && station.media[0]"
                        shrink
                        pr-4
                        pb-2
                      >
                        <v-img
                          :src="station.media[0].sizes.small.url"
                          width="90"
                        />
                      </v-flex>
                    </v-layout>
                  </v-expansion-panel-content>
                </template>
              </worker-fetch>
            </v-expansion-panel>
          </v-navigation-drawer>

          <google-map
            :filter-keys="shownStationIds"
            :locations="stations"
            :map-options="{}"
            auto-fit
            auto-zoom
            location-key="_id"
            location-lat="geo.coordinates[1]"
            location-lng="geo.coordinates[0]"
            location-title="name"
            style="width: 100%; height: 100%;"
          />
        </div>
      </template>
    </feathers-vuex-find>
  </div>
</template>

<script>
import GoogleMap from '@/components/GoogleMap'
import HcSparkline from '@/components/HcSparkline'
import StationStatusIcon from '@/components/StationStatusIcon'
import WorkerFetch from '@/components/WorkerFetch'

import moment from 'moment'
import timer from '@/mixins/timer'
import _debounce from 'lodash/debounce'
import _union from 'lodash/union'

import { mapActions, mapGetters, mapState } from 'vuex'
import { escapeRegExp } from '@/lib/utils'

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
      drawer: true,

      stationsExpand: false,
      stationsPanel: [],
      stationsPanelOpen: [],
      stationsSearch: null,
      stationsSearchDebounce: null,

      queryStationIds: [],
      shownStationIds: [],

      // TODO: Implement later
      // selectedOrgIds: null,

      seriesOptions: [
        {
          name: 'Battery Voltage'
        }
      ],

      timerInterval: 60000,

      viewToggle: 0
    }
  },

  computed: {
    ...mapGetters(['org']),
    ...mapGetters({
      getTime: 'time/get'
    }),
    ...mapState(['auth']),

    currentTime() {
      return moment.utc(this.getTime('utc').now).valueOf()
    },

    startTime() {
      return moment
        .utc(this.getTime('utc').now)
        .subtract(24, 'h')
        .toISOString()
    },

    stationsFetchQuery() {
      // TODO: Implement later
      // const { stationsSearch, selectedOrgIds } = this
      const { stationsSearch } = this

      const query = {
        is_hidden: false,
        // TODO: Remove later
        organization_id: this.org._id,
        station_type: 'weather',
        $limit: 2000, // TODO: Deal with this
        $select: [
          '_id',
          'general_config',
          'geo',
          'is_hidden',
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
      this.stationsPanelOpen = Array(newValue.length).fill(true)
    },

    stationsPaginationSearch(newValue) {
      this.queryStationIds = _union(
        this.queryStationIds,
        newValue && newValue.ids
      )
      this.shownStationIds = (newValue && newValue.ids) || []
    },

    stationsSearchDebounce(newValue) {
      this.debouncedStationsSearch(newValue)
    },

    viewToggle(newValue) {
      if (newValue === 0) {
        this.stationsExpand = false
        this.stationsPanel = []
      } else if (newValue === 1) {
        this.stationsExpand = true
        this.$nextTick(() => {
          // HACK: stationsExpand needs to be set first
          this.stationsPanel = this.stationsPanelOpen.slice(0)
        })
      }
    }
  },

  created() {
    const { query } = this.$route

    if (query && query.orgId) this.selectedOrgIds = [query.orgId]

    this.debouncedStationsSearch = _debounce(value => {
      this.stationsSearch = value
    }, 400)

    this.statFetchWorker = this.$workers.createStationStatFetchWorker()
    this.statFetchWorker.postMessage({
      accessToken: this.auth.accessToken,
      api: this.$api
    })
  },

  // mounted() {
  // },

  beforeDestroy() {
    this.debouncedStationsSearch.cancel()
    this.debouncedStationsSearch = null

    this.statFetchWorker.terminate()
    this.statFetchWorker = null
  },

  methods: {
    ...mapActions(['getSystemTimeUTC']),

    timerCallback() {
      return this.getSystemTimeUTC()
    }
  }
}
</script>

<style lang="stylus" scoped>
.station-link
  text-decoration: none
  &:hover
    text-decoration: underline
</style>

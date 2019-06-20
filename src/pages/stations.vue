<template>
  <div
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
      :watch="['fetchQuery.$or', 'fetchQuery.organization_id']"
      qid="browser"
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
            <v-expansion-panel style="margin-top: 120px;">
              <v-expansion-panel-content
                v-for="station in stations"
                :key="station._id"
                hide-actions
              >
                <template v-slot:header>
                  <div>
                    <v-icon class="mr-1" color="error" small>error</v-icon>
                    <a href="/" class="black--text station-link">{{
                      station.name
                    }}</a>
                  </div>
                </template>

                <v-layout align-end row>
                  <v-flex grow pl-2>
                    <v-card flat>
                      <v-card-text>
                        Last seen:
                      </v-card-text>

                      <v-card-actions>
                        <v-btn color="primary" flat small>Datastreams</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-flex>

                  <v-flex v-if="station.media && station.media[0]" shrink pa-2>
                    <v-img :src="station.media[0].sizes.small.url" width="80" />
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-navigation-drawer>

          <google-map
            auto-fit
            auto-zoom
            location-key="_id"
            location-lat="geo.coordinates[1]"
            location-lng="geo.coordinates[0]"
            location-title="name"
            :locations="stations"
            :map-options="{}"
            style="width: 100%; height: 100%;"
          />
        </div>
      </template>
    </feathers-vuex-find>
  </div>
</template>

<script>
import GoogleMap from '@/components/GoogleMap'

import timer from '@/mixins/timer'
import _debounce from 'lodash/debounce'

// import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { escapeRegExp } from '@/lib/utils'

export default {
  components: {
    GoogleMap
  },

  middleware: ['no-org', 'system-time-utc'],

  mixins: [timer],

  data() {
    return {
      drawer: true,

      stationsSearch: null,
      stationsSearchDebounce: null,

      queryStationIds: [],

      selectedOrgIds: null,

      timerInterval: 60000,

      viewToggle: 0
    }
  },

  computed: {
    stationsFetchQuery() {
      const { stationsSearch, selectedOrgIds } = this

      const query = {
        is_hidden: false,
        station_type: 'weather',
        $limit: 2000, // TODO: Deal with this
        $select: [
          '_id',
          'geo',
          'is_hidden',
          'media',
          'name',
          'organization_id'
        ],
        $sort: { name: 1 }
      }

      if (stationsSearch && stationsSearch.length) {
        // TODO: Implement n-grams for partial full-text search! https://en.wikipedia.org/wiki/N-gram
        query.$or = [
          {
            name: {
              $regex: `^${escapeRegExp(stationsSearch)}`,
              $options: 'i'
            }
          },
          {
            $text: { $search: `${this.stationsSearch}` }
          }
        ]
      }

      if (selectedOrgIds && selectedOrgIds.length)
        query.organization_id = { $in: selectedOrgIds }

      return query
    },

    stationsPaginationBrowser() {
      return this.$store.state.stations.pagination.browser
    },

    stationsQuery() {
      return {
        _id: { $in: this.queryStationIds },
        $sort: { name: 1 }
      }
    }
  },

  watch: {
    stationsPaginationBrowser(newValue) {
      this.queryStationIds = newValue && newValue.ids
    },

    stationsSearchDebounce(newValue) {
      this.debouncedStationsSearch(newValue)
    }
  },

  created() {
    const { query } = this.$route

    if (query && query.orgId) this.selectedOrgIds = [query.orgId]

    this.debouncedStationsSearch = _debounce(value => {
      this.stationsSearch = value
    }, 400)
  },

  // mounted() {
  // },

  beforeDestroy() {
    this.debouncedStationsSearch.cancel()
    this.debouncedStationsSearch = null
  },

  methods: {
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

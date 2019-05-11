<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout row>
          <v-flex xs12>
            <h2 class="display-3 font-weight-light mb-2">{{ org.name }}</h2>

            <p class="subheading">
              {{ org.description }}
            </p>
          </v-flex>
        </v-layout>

        <feathers-vuex-find
          :query="{
            is_hidden: false,
            organization_id: org._id,
            station_type: 'weather',
            $sort: { name: 1 }
          }"
          service="stations"
        >
          <v-layout
            slot-scope="{ isFindPending: loading, items: stations }"
            row
            wrap
          >
            <v-flex xs12 md8>
              <v-autocomplete
                v-model="selectedStationId"
                :items="stations"
                :label="loading ? 'Loading...' : 'Search for a station'"
                :loading="loading"
                flat
                hide-details
                hide-no-data
                item-text="name"
                item-value="_id"
                outline
                solo
              ></v-autocomplete>
            </v-flex>
          </v-layout>
        </feathers-vuex-find>

        <feathers-vuex-get
          v-if="selectedStationId"
          :id="selectedStationId"
          local
          service="stations"
        >
          <v-layout slot-scope="{ item: station }">
            <v-flex>
              <v-card>
                <v-card-title primary-title class="headline">
                  {{ station.name }}
                </v-card-title>

                <v-card-text>
                  <v-layout row wrap>
                    <media-photo class="xs12 sm6 md4" :media="station.media" />

                    <v-flex
                      v-if="station.geo && station.geo.coordinates.length > 1"
                      xs12
                      sm6
                      md4
                    >
                      <v-responsive aspect-ratio="1">
                        <google-map
                          :lat-lng-literal="{
                            lat: station.geo.coordinates[1],
                            lng: station.geo.coordinates[0]
                          }"
                          :map-options="{
                            draggable: false,
                            mapTypeControl: false,
                            rotateControl: false,
                            streetViewControl: false
                          }"
                          style="width: 100%; height: 100%;"
                        />
                      </v-responsive>
                    </v-flex>

                    <v-flex xs12 md4>
                      <v-card flat>
                        <v-list two-line>
                          <v-list-tile>
                            <v-list-tile-content>
                              <v-list-tile-title
                                >{{
                                  station.time
                                    | moment('', ['utc'], ['format', 'h:mm A'])
                                }}
                                {{ station.time_zone }}
                                <em
                                  >(UTC {{ station.utcOffsetHours }} hours)</em
                                ></v-list-tile-title
                              >
                            </v-list-tile-content>
                          </v-list-tile>

                          <v-divider></v-divider>

                          <v-list-tile
                            v-if="
                              station.geo && station.geo.coordinates.length > 1
                            "
                          >
                            <v-list-tile-content>
                              <v-list-tile-title
                                >{{ station.geo.coordinates[1] }}°,
                                {{
                                  station.geo.coordinates[0]
                                }}°</v-list-tile-title
                              >
                              <v-list-tile-sub-title
                                >Coordinates</v-list-tile-sub-title
                              >
                            </v-list-tile-content>
                          </v-list-tile>

                          <v-list-tile
                            v-if="
                              station.geo && station.geo.coordinates.length > 2
                            "
                          >
                            <v-list-tile-content>
                              <v-list-tile-title
                                >{{
                                  station.geo.coordinates[0]
                                    | math('', ['round', 1])
                                }}
                                {{ getUnitAbbr('Meter') }}</v-list-tile-title
                              >
                              <v-list-tile-sub-title
                                >Elevation</v-list-tile-sub-title
                              >
                            </v-list-tile-content>
                          </v-list-tile>
                        </v-list>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    :to="{
                      name: 'orgs-orgSlug-datastreams',
                      params: {
                        orgSlug: org.slug
                      },
                      query: {
                        stationId: selectedStationId
                      }
                    }"
                    color="primary"
                    exact
                    flat
                    nuxt
                    >Datastreams</v-btn
                  >

                  <v-btn
                    v-for="(link, i) in station.external_links || []"
                    :key="i"
                    :href="link.url"
                    color="primary"
                    flat
                    target="_blank"
                  >
                    {{ link.title }}</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-layout>
        </feathers-vuex-get>

        <v-layout row wrap mt-4>
          <feathers-vuex-find
            :query="{ is_hidden: false, organization_id: org._id, $limit: 0 }"
            service="stations"
          >
            <v-flex v-if="pagination" slot-scope="{ pagination }" xs12 sm4>
              <v-hover>
                <v-card
                  slot-scope="{ hover }"
                  :class="`elevation-${hover ? 8 : 2}`"
                  color="blue-grey darken-2"
                  class="white--text"
                >
                  <v-card-title primary-title class="headline">
                    {{ pagination | get('total', 0) }} stations
                  </v-card-title>
                  <v-card-actions>
                    <v-btn flat dark>Map</v-btn>
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-flex>
          </feathers-vuex-find>

          <feathers-vuex-find
            :query="{ is_hidden: false, organization_id: org._id, $limit: 0 }"
            service="datastreams"
          >
            <v-flex v-if="pagination" slot-scope="{ pagination }" xs12 sm4>
              <v-hover>
                <v-card
                  slot-scope="{ hover }"
                  :class="`elevation-${hover ? 8 : 2}`"
                  color="blue-grey darken-2"
                  class="white--text"
                >
                  <v-card-title primary-title class="headline">
                    {{ pagination | get('total', 0) }} datastreams
                  </v-card-title>
                  <v-card-actions>
                    <v-btn
                      :to="{
                        name: 'orgs-orgSlug-datastreams',
                        params: {
                          orgSlug: org.slug
                        }
                      }"
                      exact
                      flat
                      dark
                      nuxt
                      >View</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-flex>
          </feathers-vuex-find>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import GoogleMap from '@/components/GoogleMap'
import MediaPhoto from '@/components/MediaPhoto'
import timer from '@/mixins/timer'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    GoogleMap,
    MediaPhoto
  },

  middleware: ['check-org', 'dt-unit-vocabulary', 'system-time-utc'],

  mixins: [timer],

  data: () => ({
    selectedStationId: null,

    timerInterval: 60000
  }),

  computed: {
    ...mapGetters(['getUnitAbbr', 'org'])
  },

  methods: {
    ...mapActions(['getSystemTimeUTC']),

    timerCallback() {
      return this.getSystemTimeUTC()
    }
  }
}
</script>

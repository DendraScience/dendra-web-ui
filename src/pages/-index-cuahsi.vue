<template>
  <v-container fluid pa-0>
    <v-row no-gutters>
      <v-col>
        <v-img
          :max-height="$vuetify.breakpoint.smAndUp ? 540 : undefined"
          :src="require('@/assets/cuahsi/water-drop.jpg')"
          aspect-ratio="1.5"
          class="d-flex align-center"
          gradient="to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.1)"
          position="top"
        >
          <v-container pa-7>
            <v-row>
              <v-col>
                <v-img
                  :max-width="$vuetify.breakpoint.smAndUp ? 350 : 245"
                  :src="require('@/assets/cuahsi/his-logo.png')"
                  width="100%"
                />

                <h4 class="text-h5 text-sm-h4 white--text mt-2">
                  Hydrologic information system
                </h4>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" lg="8">
                <div class="text-body-2 text-sm-body-1 white--text">
                  The CUAHSI Hydrologic Information System (HIS) is an
                  internet-based system for sharing hydrologic data. It is
                  comprised of databases and servers, connected through web
                  services, to client applications, allowing for the
                  publication, discovery and access of data.
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="auto">
                <v-card color="rgba(0, 0, 0, 0.4)" dark flat tile>
                  <v-container fluid>
                    <v-row>
                      <v-col>
                        <div class="white--text mb-2">Powered by</div>

                        <a href="https://dendra.science/" target="_blank">
                          <v-img
                            :src="require('@/assets/cuahsi/dendra-logo.svg')"
                            contain
                            width="100"
                            max-height="180"
                          />
                        </a>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-img>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col class="grey lighten-4">
        <v-container pa-7>
          <!-- TODO: Finish widget page -->
          <!--
          <v-row>
            <v-col cols="12">
              <v-card class="mb-6">
                <v-card-title
                  >New! Add our Station Widget to your site.</v-card-title
                >
                <v-card-text>
                  Our Station Widget is designed to display current and forecast
                  conditions for any station on HIS. It is customizable and
                  easily embedded in any website by just pasting the HTML in any
                  place you would like the widget to appear.
                </v-card-text>

                <v-card-actions>
                  <v-btn color="primary">Get the Widget</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
 -->
          <v-row>
            <v-col cols="12" md="4">
              <h5 class="headline mb-2">Community</h5>

              <p class="body-1">
                HIS is an open source project. All code can be found on
                <a :href="githubURL" target="_blank">GitHub</a>. Please feel
                free to report any bugs, feature requests, or issues in the
                <a :href="`${githubURL}/issues/issues`" target="_blank"
                  >Issues repository</a
                >.
              </p>

              <p class="body-1">
                We have a full API for querying and downloading data with
                <a
                  href="https://dendrascience.github.io/dendra-json-schema/"
                  target="_blank"
                  >API documentation available</a
                >.
              </p>
            </v-col>

            <v-col cols="12" md="4">
              <h5 class="headline mb-2">Funding</h5>

              <p class="body-1">
                This project has been funded in collaboration by the National
                Science Foundation funded Eel River CZO, state funded UCNRS, and
                Gordon and Betty Moore Foundation funded California Heartbeat
                Initiative.
              </p>

              <p class="body-1">
                We also recently received project funding from National Science
                Foundation
                <a href="https://www.earthcube.org/" target="_blank"
                  >EarthCube</a
                >
                under grant #2126386.
              </p>
            </v-col>

            <v-col cols="12" md="4">
              <h5 class="headline mb-2">Maintenance</h5>

              <p class="body-1">
                We may need to take HIS offline for software upgrades,
                maintenance and testing. Our regularly scheduled maintenance
                window is between 8 PM and 10 PM PST daily.
              </p>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col>
        <v-container pa-7>
          <v-row>
            <v-col
              ><h5 class="headline">
                Organizations on HIS
                <nuxt-link class="body-2 ml-2" to="/orgs">View list</nuxt-link>
              </h5></v-col
            >
          </v-row>
          <v-row>
            <v-col>
              <v-lazy>
                <v-card>
                  <feathers-vuex-find
                    v-slot="{ items: stations }"
                    :query="{
                      is_active: true,
                      is_enabled: true,
                      is_hidden: false,
                      state: 'ready',
                      station_type: 'weather',
                      $limit: 2000,
                      $select: [
                        '_id',
                        'general_config',
                        'general_config_resolved',
                        'geo',
                        'is_active',
                        'is_enabled',
                        'is_hidden',
                        'state',
                        'station_type',
                        'name',
                        'organization_id',
                        'organization_lookup',
                        'slug'
                      ],
                      $sort: { organization_id: 1, name: 1 }
                    }"
                    qid="map"
                    service="stations"
                  >
                    <google-map
                      :icons="icons"
                      :info-content="infoContent"
                      :info-open="infoOpen"
                      :locations="stations"
                      :map-options="{}"
                      auto-fit
                      auto-zoom
                      location-key="_id"
                      location-lat="geo.coordinates[1]"
                      location-lng="geo.coordinates[0]"
                      location-title="name"
                      style="width: 100%; height: 600px"
                      @select-marker="selectMarker"
                    />
                  </feathers-vuex-find>
                </v-card>
              </v-lazy>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col class="grey darken-4">
        <v-container pa-7>
          <v-row>
            <v-col cols="12" md="8">
              <h5 class="title white--text mb-2">CUAHSI.HIS</h5>

              <p class="body-1 white--text">
                <a
                  :href="`mailto:${infoEmail}?subject=Question`"
                  class="white--text"
                  >{{ infoEmail }}</a
                >
              </p>

              <p class="text-body-2 white--text">
                Copyright © 2016-{{ year }} CUAHSI.HIS. All rights reserved.
              </p>
            </v-col>

            <v-col>
              <v-btn
                :href="twitterURL"
                class="mx-1"
                color="grey darken-3"
                dark
                fab
                target="_blank"
                @click="$tracker.event('socialTwitter')"
              >
                <v-icon>{{ mdiTwitter }}</v-icon>
              </v-btn>

              <v-btn
                :href="githubURL"
                class="mx-1"
                color="grey darken-3"
                dark
                fab
                target="_blank"
                @click="$tracker.event('socialGitHub')"
              >
                <v-icon>{{ mdiGithub }}</v-icon>
              </v-btn>
              <!-- NOTE: Not public for now -->
              <!--
              <v-btn
                :href="slackURL"
                class="mx-1"
                color="grey darken-3"
                dark
                fab
                target="_blank"
                @click="$tracker.event('socialSlack')"
              >
                <v-icon>{{ mdiSlack }}</v-icon>
              </v-btn>
 -->
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import vuetifyColors from 'vuetify/lib/util/colors'
import GoogleMap from '@/components/GoogleMap'

export default {
  components: {
    GoogleMap
  },

  middleware: ['no-org'],

  data() {
    return {
      infoContent: null,
      infoOpen: null
    }
  },

  computed: {
    icons() {
      return {
        default: data => ({
          anchor: { x: 4, y: 10 },
          fillColor:
            data &&
            data.general_config_resolved &&
            data.general_config_resolved.brand_color
              ? `#${data.general_config_resolved.brand_color}`
              : vuetifyColors.blueGrey.darken2,
          fillOpacity: 0.8,
          path: this.mdiMapMarker,
          scale: 1,
          strokeColor: 'white',
          strokeOpacity: 0.5,
          strokeWeight: 1
        })
      }
    },

    year() {
      return new Date().getFullYear()
    }
  },

  methods: {
    selectMarker(station) {
      if (!station) return

      const coords = station.geo.coordinates
      const link = this.$router.resolve({
        name: 'orgs-orgSlug-status-stationSlug',
        params: {
          orgSlug: station.organization_lookup.slug,
          stationSlug: station.slug
        }
      })

      this.infoContent =
        `<h3 class="title">${station.name}</h3>` +
        `<h6 class="caption">${station.organization_lookup.name}</h6>` +
        `<div class="body-1">` +
        `<a href="${link.href}">Dashboard</a> | ` +
        `<a href="https://www.google.com/maps?q=${coords[1]},${coords[0]}" target="_blank">Google</a></div>`
      this.infoOpen = station._id
    }
  }
}
</script>

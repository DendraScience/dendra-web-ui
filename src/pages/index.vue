<template>
  <div>
    <v-container fluid pa-0>
      <v-row no-gutters>
        <v-col>
          <v-img
            :height="$vuetify.breakpoint.smAndUp ? 460 : undefined"
            :src="require('@/assets/angelo-reserve.jpg')"
            aspect-ratio="1.5"
            class="fill-height d-flex align-center"
            gradient="to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.1)"
            position="top"
          >
            <v-container class="pa-sm-6">
              <v-row>
                <v-col class="subtitle-1 white--text" cols="12" md="8">
                  <v-img
                    :max-width="$vuetify.breakpoint.smAndUp ? 360 : 252"
                    :src="require('@/assets/dendra-logo.svg')"
                    aspect-ratio="4"
                    width="100%"
                  />

                  <h4 class="text-h5 text-sm-h4 white--text my-3">
                    Sensor Observatory Curation
                  </h4>

                  <div class="text-body-2 text-sm-body-1">
                    Dendra is a cyberinfrastructure project for real-time sensor
                    data storage, retrieval, management, and curation. It is a
                    cloud-based, multi-organizational system, designed to
                    support massive permanent monitoring efforts. The name is
                    derived from dendritic networks, such as river networks or
                    tree roots. Environmental monitoring performs in a similar
                    manner, pulling data from the earth’s surface to a
                    single&nbsp;location.
                  </div>
                </v-col>

                <v-col class="d-flex align-end justify-end">
                  <div>
                    <span class="caption white--text">Hosted on</span>
                    <a href="https://www.xsede.org/" target="_blank">
                      <v-img
                        width="100"
                        :src="require('@/assets/xsede-logo.png')"
                      />
                    </a>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-img>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="grey lighten-4" fluid px-0>
      <v-row no-gutters>
        <v-col>
          <v-container class="pa-sm-6">
            <v-row>
              <v-col cols="12" md="4">
                <h5 class="headline mb-2">Community</h5>

                <p class="body-1">
                  Dendra is an open source project. All code can be found on
                  <a href="https://github.com/DendraScience" target="_blank"
                    >GitHub</a
                  >. Please feel free to report any bugs, feature requests, or
                  issues in the
                  <a
                    href="https://github.com/DendraScience/issues/issues"
                    target="_blank"
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
                <h5 class="headline mb-2">Maintenance</h5>

                <p class="body-1">
                  During our rollout, we may need to take Dendra offline for
                  software upgrades and testing. Our regularly scheduled
                  maintenance window is from 8 PM to 10 PM PST daily.
                </p>
              </v-col>

              <v-col cols="12" md="4">
                <h5 class="headline mb-2">Funding</h5>

                <p class="body-1">
                  This project has been funded in collaboration by the National
                  Science Foundation funded Eel River CZO, State funded UCNRS,
                  and Gordon and Betty Moore Foundation funded California
                  Heartbeat Initiative.
                </p>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>

    <v-container fluid px-0>
      <v-row no-gutters>
        <v-col>
          <v-container class="pa-sm-6">
            <v-row>
              <v-col
                ><h5 class="headline">
                  Organizations on Dendra
                  <nuxt-link class="body-2 ml-2" to="/orgs"
                    >View list</nuxt-link
                  >
                </h5></v-col
              >
            </v-row>

            <feathers-vuex-find
              v-slot="{ items: organizations }"
              :query="{ is_enabled: true, $sort: { sort_value: 1, name: 1 } }"
              service="organizations"
            >
              <v-row>
                <v-col
                  v-for="organization in organizations"
                  :key="organization._id"
                  cols="auto"
                >
                  <v-btn
                    :to="{
                      name: 'orgs-orgSlug',
                      params: { orgSlug: organization.slug }
                    }"
                    ><v-icon
                      :color="
                        organization.general_config_resolved &&
                        organization.general_config_resolved.brand_color
                          ? `#${organization.general_config_resolved.brand_color}`
                          : 'blue-grey darken-2'
                      "
                      left
                      >{{ mdiMapMarker }}</v-icon
                    ><span
                      class="d-inline-block text-truncate"
                      style="max-width: 260px"
                      >{{ organization.name }}</span
                    ></v-btn
                  >
                </v-col>
              </v-row>
            </feathers-vuex-find>

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
    </v-container>
  </div>
</template>

<script>
import vuetifyColors from 'vuetify/lib/util/colors'
import GoogleMap from '@/components/GoogleMap'

export default {
  components: {
    GoogleMap
  },

  data() {
    return {
      infoContent: null,
      infoOpen: null
    }
  },

  middleware: ['no-org'],

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
    }
  },

  methods: {
    selectMarker(station) {
      if (!station) return

      /* eslint-disable-next-line no-console */
      console.log('>>>', station)

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

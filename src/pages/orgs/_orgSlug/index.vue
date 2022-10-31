<template>
  <v-container v-if="org">
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light my-2">{{ org.name }}</h2>
        <h3 v-if="org.description" class="subtitle-1 mb-2">
          {{ org.description }}
        </h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <station-total
          :show-disabled="$canCreate('stations', org)"
          :org="org"
        />
      </v-col>

      <v-col cols="12" md="4">
        <datastream-total
          :show-disabled="$canCreate('datastreams', org)"
          :org="org"
        />
      </v-col>

      <v-col cols="12" md="4">
        <annotation-total
          :show-disabled="$canCreate('annotations', org)"
          :org="org"
        />
      </v-col>
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
                :extend-bounds="extendBounds"
                :icons="icons"
                :info-content="infoContent"
                :info-open="infoOpen"
                :locations="stations"
                :map-options="{}"
                :marker-options="markerOptions"
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
</template>

<script>
import { mapGetters } from 'vuex'
import vuetifyColors from 'vuetify/lib/util/colors'
import AnnotationTotal from '@/components/AnnotationTotal'
import DatastreamTotal from '@/components/DatastreamTotal'
import GoogleMap from '@/components/GoogleMap'
import StationTotal from '@/components/StationTotal'

export default {
  components: {
    AnnotationTotal,
    DatastreamTotal,
    GoogleMap,
    StationTotal
  },

  middleware: ['check-org'],

  data() {
    return {
      infoContent: null,
      infoOpen: null
    }
  },

  computed: {
    ...mapGetters(['org']),

    icons() {
      return {
        default: data => ({
          anchor: { x: 4, y: 10 },
          fillColor:
            data &&
            data.organization_id === this.org._id &&
            data.general_config_resolved &&
            data.general_config_resolved.brand_color
              ? `#${data.general_config_resolved.brand_color}`
              : vuetifyColors.blueGrey.lighten3,
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
    extendBounds(station) {
      return station.organization_id === this.org._id
    },

    markerOptions(station) {
      return { zIndex: station.organization_id === this.org._id ? 10 : 9 }
    },

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

<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline">
          <slot>Geo coordinates</slot>
        </v-col>
      </v-row>

      <v-row v-if="value.geo">
        <v-col cols="12" md="6">
          <ValidationProvider
            v-slot="{ errors }"
            name="latitude"
            rules="required|between:-90,90"
          >
            <v-text-field
              v-model.trim="value.geoCoordinates.lat"
              :error-messages="errors"
              :readonly="!editing"
              label="Latitude"
              required
            ></v-text-field>
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ errors }"
            name="longitude"
            rules="required|between:-180,180"
          >
            <v-text-field
              v-model.trim="value.geoCoordinates.lng"
              :error-messages="errors"
              :readonly="!editing"
              label="Longitude"
              required
            ></v-text-field>
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ errors }"
            name="elevation"
            rules="between:-9000,9000"
          >
            <v-text-field
              v-model.trim="value.geoCoordinates.ele"
              :error-messages="errors"
              :readonly="!editing"
              label="Elevation"
            ></v-text-field>
          </ValidationProvider>
        </v-col>

        <v-col cols="12" md="6">
          <google-map
            :icons="icons"
            :map-options="{}"
            auto-fit
            auto-pan
            auto-zoom
            :lat-lng-literal="latLngLiteral"
            style="width: 100%; height: 300px;"
          />
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col><v-subheader>No coordinates defined</v-subheader></v-col>
      </v-row>
    </v-container>

    <v-card-actions v-if="editing">
      <v-btn v-if="value.geo" color="primary" @click="remove">
        <v-icon>{{ mdiMinus }}</v-icon>
      </v-btn>

      <v-btn v-else color="primary" @click="add">
        <v-icon>{{ mdiPlus }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import vuetifyColors from 'vuetify/lib/util/colors'
import _debounce from 'lodash/debounce'
import { ValidationProvider } from 'vee-validate'
import GoogleMap from '@/components/GoogleMap'
import itemEditing from '@/mixins/item-editing'

export default {
  components: {
    GoogleMap,
    ValidationProvider
  },

  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    latLngLiteral: {
      lat: 0,
      lng: 0
    }
  }),

  computed: {
    icons() {
      return {
        default: {
          anchor: { x: 8, y: 20 },
          fillColor: vuetifyColors.blueGrey.darken2,
          fillOpacity: 1,
          path: this.mdiMapMarker,
          scale: 2,
          strokeColor: 'white',
          strokeOpacity: 0.5,
          strokeWeight: 1
        }
      }
    }
  },

  watch: {
    'value.geoCoordinates': {
      handler(newValue) {
        this.debouncedSearch({
          lat: newValue.lat | 0,
          lng: newValue.lng | 0
        })
      },
      deep: true
    }
  },

  created() {
    this.debouncedSearch = _debounce(value => {
      this.latLngLiteral = value
    }, 1000)
  },

  mounted() {
    this.latLngLiteral = {
      lat: this.value.geoCoordinates.lat | 0,
      lng: this.value.geoCoordinates.lng | 0
    }
  },

  beforeDestroy() {
    this.debouncedSearch.cancel()
    this.debouncedSearch = null
  }
}
</script>

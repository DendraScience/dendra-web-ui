<template>
  <v-card>
    <v-card-title class="headline">
      <slot>Geo coordinates</slot>
    </v-card-title>

    <v-container fluid pt-0 px-4>
      <v-layout v-if="value.geo" wrap>
        <v-flex xs12 md6>
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
        </v-flex>

        <v-flex xs12 md6>
          <google-map
            :map-options="{}"
            auto-fit
            auto-pan
            auto-zoom
            :lat-lng-literal="latLngLiteral"
            style="width: 100%; height: 300px;"
          />
        </v-flex>
      </v-layout>

      <v-layout v-else>
        <v-flex class="grey--text">No coordinates defined</v-flex>
      </v-layout>
    </v-container>

    <v-card-actions v-if="editing">
      <v-btn v-if="value.geo" color="primary" @click="remove">
        <v-icon>remove</v-icon>
      </v-btn>

      <v-btn v-else color="primary" @click="add">
        <v-icon>add</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
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

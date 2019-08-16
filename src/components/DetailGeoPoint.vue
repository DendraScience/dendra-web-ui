<template>
  <v-card>
    <v-card-title class="headline">
      <slot>Geo coordinates</slot>
    </v-card-title>

    <v-container fluid pt-0 px-4>
      <v-layout v-if="value.geo" wrap>
        <v-flex xs12 md6>
          <v-text-field
            v-model.number="value.geoCoordinates.lat"
            v-validate="'required|decimal'"
            :error-messages="errors.collect('latitude')"
            :readonly="!editing"
            data-vv-name="latitude"
            label="Latitude"
            required
          ></v-text-field>

          <v-text-field
            v-model.number="value.geoCoordinates.lng"
            v-validate="'required|decimal'"
            :error-messages="errors.collect('longitude')"
            :readonly="!editing"
            data-vv-name="longitude"
            label="Longitude"
            required
          ></v-text-field>

          <v-text-field
            v-model.number="value.geoCoordinates.ele"
            v-validate="'decimal'"
            :error-messages="errors.collect('elevation')"
            :readonly="!editing"
            data-vv-name="elevation"
            label="Elevation"
            required
          ></v-text-field>
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
import GoogleMap from '@/components/GoogleMap'

export default {
  components: {
    GoogleMap
  },

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  inject: ['$validator'],

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
  },

  methods: {
    add() {
      this.$emit('add')
    },

    remove() {
      this.$emit('remove')
    }
  }
}
</script>

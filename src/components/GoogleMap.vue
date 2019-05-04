<template>
  <div></div>
</template>

<script>
import debounce from 'lodash/debounce'
import loadGoogleMapsAPI from 'load-google-maps-api'

const DEFAULT_MAP_OPTIONS = {
  disableDefaultUi: false,
  draggable: true,
  fullscreenControl: true,
  mapTypeControl: true,
  rotateControl: true,
  scaleControl: true,
  scrollwheel: false,
  streetViewControl: true,
  zoom: 10,
  zoomControl: true
}

export default {
  props: {
    latLngLiteral: { default: null, type: Object },
    mapOptions: { default: null, type: Object },
    title: { default: '', type: String }
  },

  data() {
    return {
      googleMapsAPIKey: process.env.googleMapsAPIKey
    }
  },

  watch: {
    latLngLiteral(newValue) {
      if (!(this.maps && this.map && this.marker)) return

      this.latLng = new this.maps.LatLng(newValue)
      this.marker.setPosition(this.latLng)
      this.map.panTo(this.latLng)
    },

    title(newValue) {
      if (!(this.maps && this.map && this.marker)) return

      this.marker.setTitle(newValue)
    }
  },

  mounted() {
    Promise.resolve(window.google)
      .then(google => {
        return google
          ? google.maps
          : loadGoogleMapsAPI({
              key: this.googleMapsAPIKey
            })
      })
      .then(maps => {
        this.maps = maps

        /*
          Configure and create map.
         */

        const mapOpts = Object.assign({}, DEFAULT_MAP_OPTIONS, this.mapOptions)

        if (this.latLngLiteral) {
          this.latLng = new maps.LatLng(this.latLngLiteral)

          Object.assign(mapOpts, {
            center: this.latLng
          })
        }

        this.map = new maps.Map(this.$el, mapOpts)

        /*
          Configure and create marker.
         */

        const markerOpts = {
          map: this.map
        }

        if (this.latLng) markerOpts.position = this.latLng
        if (this.title > '') markerOpts.title = this.title

        // Only create the marker if we have a position
        if (!markerOpts.position) return

        this.marker = new this.maps.Marker(markerOpts)

        // Ensure the marker is visible
        this.panToMarker()

        // Adjust the map after the center position changes
        this.centerChangedListener = debounce(this.panToMarker, 2000)

        this.map.addListener('center_changed', this.centerChangedListener)
        this.marker.addListener('click', this.selectMarker)
      })
      .catch(err => {
        this.$logger.log(err)
      })
  },

  beforeDestroy() {
    if (this.centerChangedListener) this.centerChangedListener.cancel()

    if (this.maps) this.maps.event.clearInstanceListeners(window)
    if (this.maps) this.maps.event.clearInstanceListeners(this.maps)
    if (this.maps && this.map) this.maps.event.clearInstanceListeners(this.map)
    if (this.maps && this.marker)
      this.maps.event.clearInstanceListeners(this.marker)

    this.latLng = this.maps = this.map = this.marker = this.centerChangedListener = null
  },

  methods: {
    panToMarker() {
      if (this.map && this.marker) this.map.panTo(this.marker.getPosition())
    },

    selectMarker() {
      this.$emit('select-marker', this.coordinates)
    }
  }
}
</script>

<template>
  <div></div>
</template>

<script>
import _debounce from 'lodash/debounce'
import _get from 'lodash/get'

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
    autoFit: { default: false, type: Boolean },
    autoPan: { default: false, type: Boolean },
    autoZoom: { default: false, type: Boolean },
    hideMarker: { default: false, type: Boolean },
    latLngLiteral: { default: null, type: Object },
    locationKey: { default: 'id', type: String },
    locationLat: { default: 'lat', type: String },
    locationLng: { default: 'lng', type: String },
    locationTitle: { default: 'title', type: String },
    locations: {
      default: () => [],
      type: Array
    },
    mapOptions: { default: null, type: Object },
    mapTypeControlPosition: { default: 'BOTTOM_CENTER', type: String },
    mapTypeControlStyle: { default: 'HORIZONTAL_BAR', type: String },
    markerTitle: { default: '', type: String }
  },

  watch: {
    latLngLiteral(newValue) {
      if (!this.maps) return

      this.latLng = new this.maps.LatLng(newValue)

      if (this.marker) this.marker.setPosition(this.latLng)
      if (this.autoPan) this.panToLatLng()
    },

    locations(newValue) {
      this.updateMarkers(newValue)
    },

    markerTitle(newValue) {
      if (!(this.maps && this.marker)) return

      this.marker.setTitle(newValue)
    }
  },

  created() {
    this.markers = {}
    this.needsRezoom = false
  },

  mounted() {
    this.$maps()
      .then(maps => {
        this.maps = maps

        /*
          Configure and create map.
         */

        const mapOpts = Object.assign(
          {},
          DEFAULT_MAP_OPTIONS,
          this.mapOptions,
          {
            mapTypeControlOptions: {
              position: maps.ControlPosition[this.mapTypeControlPosition],
              style: maps.MapTypeControlStyle[this.mapTypeControlStyle]
            }
          }
        )

        if (this.latLngLiteral) {
          this.latLng = new maps.LatLng(this.latLngLiteral)

          Object.assign(mapOpts, {
            center: this.latLng
          })
        }

        this.map = new maps.Map(this.$el, mapOpts)

        /*
          Configure and create markers.
         */

        if (this.latLng && !this.hideMarker) {
          const markerOpts = {
            map: this.map,
            position: this.latLng
          }
          if (this.markerTitle > '') markerOpts.title = this.markerTitle

          this.marker = new this.maps.Marker(markerOpts)
          this.marker.addListener('click', this.selectMarker)
        }

        this.updateMarkers(this.locations)

        // Auto-fit to bounds after a window resize
        if (this.autoFit) {
          this.debouncedFitToBounds = _debounce(this.fitToBounds, 2000)
          this.maps.event.addDomListener(
            window,
            'resize',
            this.debouncedFitToBounds
          )
        }

        // Auto-zoom after the bounds change
        if (this.autoZoom) {
          this.map.addListener('bounds_changed', this.rezoomIfNeeded)
        }

        // Auto-pan after the center position changes
        if (this.autoPan) {
          this.panToLatLng()

          this.debouncedPanToLatLng = _debounce(this.panToLatLng, 2000)
          this.map.addListener('center_changed', this.debouncedPanToLatLng)
        }
      })
      .catch(err => {
        this.$logger.log(err)
      })
  },

  beforeDestroy() {
    const { map, maps, marker, markers } = this

    if (this.debouncedPanToLatLng) this.debouncedPanToLatLng.cancel()
    if (this.debouncedFitToBounds) this.debouncedFitToBounds.cancel()

    if (maps) maps.event.clearInstanceListeners(window)
    if (maps) maps.event.clearInstanceListeners(maps)
    if (maps && map) maps.event.clearInstanceListeners(map)
    if (maps && marker) maps.event.clearInstanceListeners(marker)

    Object.keys(markers).forEach(key =>
      maps.event.clearInstanceListeners(markers[key])
    )

    this.bounds = null
    this.debouncedFitToBounds = null
    this.debouncedPanToMarker = null
    this.latLng = null
    this.map = null
    this.maps = null
    this.marker = null
    this.markers = null
  },

  methods: {
    fitToBounds() {
      if (!(this.map && this.bounds)) return

      this.needsRezoom = true
      this.map.fitBounds(this.bounds)
      // TODO: Could try a less dramatic option
      // this.map.panToBounds(this.bounds)
    },

    panToLatLng() {
      if (!(this.map && this.latLng)) return

      this.map.panTo(this.latLng)
    },

    rezoomIfNeeded() {
      if (!(this.map && this.needsRezoom)) return

      this.needsRezoom = false
      if (this.map.getZoom() > 10) this.map.setZoom(10)
      // TODO: Could try this to keep all markers inside map area
      // } else {
      //   this.map.setZoom(this.map.getZoom() - 1)
      // }
    },

    selectMarker() {
      this.$emit('select-marker')
    },

    updateMarkers(locations) {
      if (!(this.map && this.markers)) return

      // Remove markers from map, but keep cached
      Object.keys(this.markers).forEach(key => this.markers[key].setMap(null))

      if (!locations.length) return

      const bounds = (this.bounds = new this.maps.LatLngBounds())

      // Add new markers to map
      locations.forEach(location => {
        const key = _get(location, this.locationKey)
        const lat = _get(location, this.locationLat)
        const lng = _get(location, this.locationLng)
        const title = _get(location, this.locationTitle)

        // Markers are cached by location key
        let marker = this.markers[key]

        if (marker) {
          marker.setMap(this.map)
        } else if (lat && lng) {
          const position = new this.maps.LatLng({ lat, lng })
          const markerOpts = {
            map: this.map,
            position
          }
          if (title > '') markerOpts.title = title

          marker = this.markers[key] = new this.maps.Marker(markerOpts)
          marker.addListener('click', this.selectMarker.bind(this, key))
        }

        if (marker) bounds.extend(marker.getPosition())
      })

      if (this.autoFit) this.fitToBounds()
    }
  }
}
</script>

<template>
  <div></div>
</template>

<script>
import { mdiMapMarkerCheck } from '@mdi/js'
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
  zoom: 8,
  zoomControl: true
}

export default {
  props: {
    autoFit: { default: false, type: Boolean },
    autoPan: { default: false, type: Boolean },
    autoZoom: { default: false, type: Boolean },
    defaultIcon: { default: 'default', type: String },
    dataIcon: { default: 'icon', type: String },
    extendBounds: { default: null, type: Function },
    filterKeys: { default: null, type: Array },
    hideMarker: { default: false, type: Boolean },
    icons: { default: null, type: Object },
    infoContent: { default: '', type: String },
    infoOpen: { default: '', type: String },
    latLngLiteral: { default: null, type: Object },
    locationKey: { default: 'id', type: String },
    locationLat: { default: 'lat', type: String },
    locationLng: { default: 'lng', type: String },
    locationTitle: { default: 'title', type: String },
    locations: {
      default: () => [],
      type: Array
    },
    locationsData: {
      default: () => {},
      type: Object
    },
    mapOptions: { default: null, type: Object },
    mapTypeControlPosition: { default: 'BOTTOM_CENTER', type: String },
    mapTypeControlStyle: { default: 'HORIZONTAL_BAR', type: String },
    markerOptions: { default: null, type: [Function, Object] },
    markerTitle: { default: '', type: String }
  },

  data: () => ({
    mdiMapMarkerCheck
  }),

  watch: {
    infoContent(newValue) {
      const { infoWindow } = this

      if (!infoWindow) return

      infoWindow.setContent(newValue)
    },

    infoOpen(newValue) {
      const { infoWindow, map, markers } = this

      if (!(infoWindow && map && markers)) return

      if (newValue) {
        const marker = markers[newValue]
        if (marker) infoWindow.open(map, marker)
      } else {
        infoWindow.close()
      }
    },

    latLngLiteral(newValue) {
      const { maps, marker } = this

      if (!maps) return

      const latLng = (this.latLng = new maps.LatLng(newValue))

      if (marker) marker.setPosition(latLng)
      if (this.autoPan) this.panToLatLng()
    },

    locations(newValue) {
      this.updateMarkers(newValue)
    },

    locationsData(newValue) {
      const { dataIcon, defaultIcon, maps, markers, setMarkerIcon } = this

      if (!maps) return

      Object.keys(markers).forEach(key => {
        // Markers are cached by location key
        const marker = markers[key]
        const data = newValue[key]

        setMarkerIcon(marker, _get(data, dataIcon, defaultIcon), data)
      })
    },

    markerTitle(newValue) {
      const { map, marker } = this

      if (!(map && marker)) return

      marker.setTitle(newValue)
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

        const map = (this.map = new maps.Map(this.$el, mapOpts))

        /*
          Configure and create markers.
         */

        if (this.latLng && !this.hideMarker) {
          const markerOpts = {
            map,
            position: this.latLng
          }
          const { markerTitle } = this
          if (markerTitle) markerOpts.title = markerTitle

          const marker = (this.marker = new maps.Marker(markerOpts))
          marker.addListener('click', this.selectMarker)
          this.setMarkerIcon(marker, this.defaultIcon)
        }

        this.updateMarkers(this.locations)

        // Auto-fit to bounds after a window resize
        if (this.autoFit) {
          this.debouncedFitToBounds = _debounce(this.fitToBounds, 2000)
          maps.event.addDomListener(window, 'resize', this.debouncedFitToBounds)
        }

        // Auto-zoom after the bounds change
        if (this.autoZoom)
          map.addListener('bounds_changed', this.rezoomIfNeeded)

        // Auto-pan after the center position changes
        if (this.autoPan) {
          this.panToLatLng()

          this.debouncedPanToLatLng = _debounce(this.panToLatLng, 2000)
          map.addListener('center_changed', this.debouncedPanToLatLng)
        }

        // Create infoe window in case we need it
        this.infoWindow = new maps.InfoWindow()
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
    this.infoWindow = null
    this.latLng = null
    this.map = null
    this.maps = null
    this.marker = null
    this.markers = null
  },

  methods: {
    fitToBounds() {
      const { map, bounds } = this

      if (!(map && bounds)) return

      this.needsRezoom = true
      map.fitBounds(bounds)

      // TODO: Could try a less dramatic option
      // map.panToBounds(this.bounds)
    },

    panToLatLng() {
      const { map, latLng } = this

      if (!(map && latLng)) return

      map.panTo(latLng)
    },

    rezoomIfNeeded() {
      const { map } = this

      if (!(map && this.needsRezoom)) return

      this.needsRezoom = false
      if (map.getZoom() > 8) map.setZoom(8)

      // TODO: Could try this to keep all markers inside map area
      // } else {
      //   map.setZoom(this.map.getZoom() - 1)
      // }
    },

    selectMarker(location) {
      this.$emit('select-marker', location)
    },

    setMarkerIcon(marker, icon, data) {
      const { icons, maps } = this

      if (!icons) return

      icon = icons[icon]
      if (icon) {
        icon = Object.assign({}, typeof icon === 'function' ? icon(data) : icon)
        const { anchor } = icon

        if (anchor) icon.anchor = new maps.Point(anchor.x, anchor.y)

        marker.setIcon(icon)
      }
    },

    updateMarkers(locations) {
      const {
        defaultIcon,
        extendBounds,
        map,
        maps,
        markerOptions,
        markers,
        selectMarker,
        setMarkerIcon
      } = this
      if (!(map && markers)) return

      // Remove markers from map, but keep cached
      Object.keys(markers).forEach(key => markers[key].setMap(null))

      if (!locations.length) return

      const bounds = (this.bounds = new maps.LatLngBounds())
      const { filterKeys } = this

      // Add new markers to map
      locations.forEach(location => {
        const key = _get(location, this.locationKey)
        const lat = _get(location, this.locationLat)
        const lng = _get(location, this.locationLng)
        const title = _get(location, this.locationTitle)

        if (filterKeys && !filterKeys.includes(key)) return

        // Markers are cached by location key
        let marker = markers[key]

        if (marker) {
          marker.setMap(map)
        } else if (lat && lng) {
          const position = new maps.LatLng({ lat, lng })
          const markerOpts = Object.assign(
            {},
            typeof markerOptions === 'function'
              ? markerOptions(location)
              : markerOptions,
            {
              map,
              position
            }
          )
          if (title > '') markerOpts.title = title

          marker = markers[key] = new maps.Marker(markerOpts)
          marker.addListener('click', selectMarker.bind(this, location))
          setMarkerIcon(marker, defaultIcon, location)
        }

        if (marker && (!extendBounds || extendBounds(location)))
          bounds.extend(marker.getPosition())
      })

      if (this.autoFit) this.fitToBounds()
    }
  }
}
</script>

<template>
  <div class="d-inline">
    <v-icon v-if="status === 1" color="success" small>mdi-check-circle</v-icon>
    <v-icon v-else-if="status === 2" color="error" small>mdi-alert</v-icon>
    <v-icon v-else color="accent" small>mdi-help-rhombus-outline</v-icon>
  </div>
</template>

<script>
const DEFAULT_THRESHOLD = 120

export default {
  props: {
    currentTime: { default: null, type: Number },
    lastSeenTime: { default: null, type: Number },
    station: { default: null, type: Object }
  },

  computed: {
    status() {
      const { currentTime, lastSeenTime, station } = this

      if (!(currentTime && lastSeenTime && station)) return 0

      const threshold =
        ((station &&
          station.general_config_resolved &&
          station.general_config_resolved.station_offline_threshold) ||
          DEFAULT_THRESHOLD) | 0
      if (currentTime - lastSeenTime > threshold * 60000) return 2

      return 1
    }
  }
}
</script>

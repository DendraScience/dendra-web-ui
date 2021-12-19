<template>
  <div class="d-inline">
    <v-icon
      v-if="station.state === 'disconnected'"
      color="yellow darken-2"
      small
      >{{ mdiCheckboxBlankOff }}</v-icon
    >
    <v-icon v-else-if="value && value.isOnline" color="green lighten-1" small>{{
      mdiCheckCircle
    }}</v-icon>
    <v-icon v-else-if="value" color="deep-orange darken-3" small>{{
      mdiAlert
    }}</v-icon>
    <v-icon v-else color="blue-grey darken-2" small>{{
      mdiHelpRhombusOutline
    }}</v-icon>
  </div>
</template>

<script>
export default {
  props: {
    station: { default: null, type: Object },
    value: { default: null, type: Object }
  }
}
</script>

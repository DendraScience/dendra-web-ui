<template>
  <div class="d-inline">
    <v-icon v-if="value && value.isOnline" color="success" small>{{
      mdiCheckCircle
    }}</v-icon>
    <v-icon v-else-if="value" color="error" small>{{ mdiAlert }}</v-icon>
    <v-icon v-else color="accent" small>{{ mdiHelpRhombusOutline }}</v-icon>
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

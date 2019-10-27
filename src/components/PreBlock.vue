<template>
  <v-card v-if="value" class="ma-2 px-2 py-1" color="grey lighten-2" flat>
    <span v-if="$vuetify.breakpoint.xsOnly">{{
      value | truncate({ length: 50 })
    }}</span>
    <pre v-else>{{ value }}</pre>
  </v-card>
</template>

<script>
export default {
  props: {
    value: { default: null, type: Object }
  }
}
</script>

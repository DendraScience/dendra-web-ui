<template>
  <span class="text-xs-right text-no-wrap">
    <v-avatar v-if="value.is_enabled === false" color="grey" size="20">
      <v-icon dark small>not_interested</v-icon>
    </v-avatar>

    <v-avatar v-if="value.is_hidden === true" color="grey" size="20">
      <v-icon dark small>visibility_off</v-icon>
    </v-avatar>
  </span>
</template>

<script>
export default {
  props: {
    value: { type: Object, required: true }
  }
}
</script>

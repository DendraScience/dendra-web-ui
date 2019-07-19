<template>
  <v-layout row wrap>
    <v-flex v-if="typeof value.is_enabled === 'boolean'" shrink pt-0>
      <v-checkbox
        v-model="value.is_enabled"
        :disabled="!editing || $cannot('assign', value, '$set.is_enabled')"
        hide-details
        label="enabled"
      ></v-checkbox>
    </v-flex>

    <v-flex v-if="typeof value.is_hidden === 'boolean'" shrink pt-0>
      <v-checkbox
        v-model="value.is_hidden"
        :disabled="!editing || $cannot('assign', value, '$set.is_hidden')"
        hide-details
        label="hidden"
      ></v-checkbox>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  }
}
</script>

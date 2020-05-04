<template>
  <v-row>
    <v-col>
      <v-chip v-if="value._id" class="ma-1" label>id: {{ value._id }}</v-chip>
      <v-chip v-if="value.version_id" class="ma-1" label outlined
        >version: {{ value.version_id }}</v-chip
      >
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    value: { type: Object, required: true }
  }
}
</script>

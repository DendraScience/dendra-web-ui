<template>
  <v-layout>
    <v-flex>
      <v-chip v-if="value._id" class="mr-2" label>id: {{ value._id }}</v-chip>
      <v-chip v-if="value.version_id" label
        >version: {{ value.version_id }}</v-chip
      >
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: {
    value: { type: Object, required: true }
  }
}
</script>

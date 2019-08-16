<template>
  <v-container fluid grid-list-lg>
    <v-layout column>
      <v-flex>
        <v-text-field
          v-model.trim="value.title"
          v-validate="'required|min:5|max:100'"
          :error-messages="errors.collect('title')"
          autofocus
          data-vv-name="title"
          label="Title"
          required
          solo
        ></v-text-field>

        <v-text-field
          v-model.trim="value.url"
          v-validate="{ required: true, url: { require_protocol: true } }"
          :error-messages="errors.collect('url')"
          autofocus
          data-vv-name="url"
          label="URL"
          required
          solo
        ></v-text-field>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  inject: ['$validator'],

  props: {
    value: { type: Object, required: true }
  }
}
</script>

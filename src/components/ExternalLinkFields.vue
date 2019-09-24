<template>
  <v-container fluid>
    <v-layout column>
      <v-flex>
        <ValidationProvider
          v-slot="{ errors }"
          name="title"
          rules="required|min:5|max:100"
        >
          <v-text-field
            v-model.trim="value.title"
            :error-messages="errors"
            autofocus
            label="Title"
            required
            solo
          ></v-text-field>
        </ValidationProvider>

        <ValidationProvider
          v-slot="{ errors }"
          name="url"
          :rules="{
            regex: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            required: true
          }"
        >
          <v-text-field
            v-model.trim="value.url"
            :error-messages="errors"
            label="URL"
            required
            solo
          ></v-text-field>
        </ValidationProvider>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { ValidationProvider } from 'vee-validate'

export default {
  components: {
    ValidationProvider
  },

  props: {
    value: { type: Object, required: true }
  }
}
</script>

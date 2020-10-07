<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <ValidationProvider
          v-slot="{ errors }"
          name="title"
          rules="required|min:1|max:100"
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
            required: true,
            url: {
              protocols: ['http', 'https'],
              require_protocol: true
            }
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
      </v-col>
    </v-row>
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

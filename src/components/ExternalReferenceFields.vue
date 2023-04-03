<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <ValidationProvider
          v-slot="{ errors }"
          name="type"
          :rules="{
            required: true,
            resolved_valid: typeResolved
          }"
        >
          <v-text-field
            v-model.trim="value.type"
            :error-messages="typeResolved.error || errors"
            autofocus
            label="Type"
            required
            solo
          ></v-text-field>
        </ValidationProvider>

        <ValidationProvider
          v-slot="{ errors }"
          name="identifier"
          rules="required"
        >
          <v-text-field
            v-model.trim="value.identifier"
            :error-messages="errors"
            label="Identifier"
            required
            solo
          ></v-text-field>
        </ValidationProvider>

        <ValidationProvider
          v-slot="{ errors }"
          name="url"
          :rules="{
            required: false,
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
    value: { type: Object, required: true },
    typeResolved: { type: Object, required: true }
  }
}
</script>

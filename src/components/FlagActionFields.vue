<template>
  <v-container fluid>
    <v-layout column>
      <v-flex>
        <ValidationProvider
          v-slot="{ errors }"
          :rules="{ alpha_num: true, max: 20, required: true }"
          name="flag"
        >
          <v-text-field
            v-model.trim="value.flag"
            :error-messages="errors"
            autofocus
            label="Flag"
            prepend-inner-icon="mdi-flag"
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

<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <ValidationProvider
          v-slot="{ errors }"
          :rules="{ alpha_num: true, max: 20, required: true }"
          name="flag"
        >
          <v-text-field
            v-model.trim="value.flag"
            :error-messages="errors"
            :prepend-inner-icon="mdiFlag"
            autofocus
            label="Flag"
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

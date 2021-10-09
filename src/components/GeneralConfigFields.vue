<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <v-btn :disabled="!settingsResolved.valid" @click="makePretty"
          >Make Pretty</v-btn
        >
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <ValidationProvider
          name="settings"
          :rules="{
            resolved_valid: settingsResolved
          }"
        >
          <v-textarea
            id="textarea1578268528116"
            v-model.trim="value.settings"
            :error-messages="settingsResolved.error"
            background-color="grey darken-4"
            dark
            label="Config settings"
            rows="16"
            spellcheck="false"
            filled
          ></v-textarea>
        </ValidationProvider>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import { jsonFormat } from '@/lib/utils'

export default {
  components: {
    ValidationProvider
  },

  props: {
    settingsResolved: { type: Object, required: true },
    value: { type: Object, required: true }
  },

  methods: {
    makePretty() {
      this.value.settings = jsonFormat(this.settingsResolved.data)
    }
  }
}
</script>

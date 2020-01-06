<template>
  <v-container fluid>
    <v-layout column>
      <v-flex>
        <v-btn
          :disabled="!settingsResolved.valid"
          class="mb-2"
          @click="makePretty"
          >Make Pretty</v-btn
        >
      </v-flex>

      <v-flex>
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
      </v-flex>
    </v-layout>
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

<style>
#textarea1578268528116 {
  font-family: monospace !important;
}
</style>

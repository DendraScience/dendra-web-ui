<template>
  <v-dialog v-model="value.dialog" :max-width="maxWidth">
    <v-card>
      <ValidationObserver ref="observer" v-slot="{ invalid }">
        <v-card-title class="headline grey lighten-4 mb-4"
          ><slot name="title"
        /></v-card-title>

        <slot :value="value" />

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="invalid" color="primary" text @click="commit"
            >OK</v-btn
          >
          <v-btn color="primary" text @click="value.dialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </ValidationObserver>
    </v-card>
  </v-dialog>
</template>

<script>
import { ValidationObserver } from 'vee-validate'

export default {
  components: {
    ValidationObserver
  },

  props: {
    maxWidth: { default: 680, type: [Number, String] },
    value: { type: Object, required: true }
  },

  methods: {
    commit() {
      this.$emit('commit', this.value)
    }
  }
}
</script>

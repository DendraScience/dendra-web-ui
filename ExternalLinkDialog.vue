<template>
  <v-dialog v-model="value.dialog" max-width="680">
    <v-card>
      <v-card-title class="headline grey lighten-4 mb-4"
        >Specify external link</v-card-title
      >

      <external-link-fields v-model="value" />

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="!valid" color="primary" text @click="commit"
          >OK</v-btn
        >
        <v-btn color="primary" text @click="value.dialog = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import ExternalLinkFields from '@/components/ExternalLinkFields'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    ExternalLinkFields
  },

  props: {
    value: { type: Object, required: true }
  },

  computed: {
    valid() {
      return Object.keys(this.fields).every(
        key =>
          this.fields[key].valid ||
          (this.fields[key].pristine && this.value.key !== undefined)
      )
    }
  },

  methods: {
    commit() {
      this.$emit('commit', this.value)
    }
  }
}
</script>

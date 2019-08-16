<template>
  <v-dialog v-model="value.dialog" max-width="680">
    <v-card>
      <v-card-title class="headline grey lighten-4 mb-4"
        ><slot name="title"
      /></v-card-title>

      <slot :value="value" />

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
export default {
  $_veeValidate: {
    validator: 'new'
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

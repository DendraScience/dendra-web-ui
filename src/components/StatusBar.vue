<template>
  <v-snackbar
    v-model="snackbar"
    multi-line
    top
    :color="status.type"
    :timeout="status.type === 'error' ? 10000 : 3000"
  >
    {{ status.message }}

    <template v-slot:action="{ attrs }">
      <v-btn v-bind="attrs" dark text @click="snackbar = null"> Close </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  props: {
    value: { default: null, type: Object }
  },

  data: () => ({
    snackbar: false,
    status: {
      message: '',
      type: 'info'
    }
  }),

  watch: {
    value(newValue) {
      this.status = Object.assign(
        {
          message: 'Hello world.',
          type: 'info'
        },
        newValue
      )
      this.snackbar = true
    }
  }
}
</script>

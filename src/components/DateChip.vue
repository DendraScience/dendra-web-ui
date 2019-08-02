<template>
  <v-chip
    v-if="value"
    :color="color"
    :outlined="outlined"
    @dblclick="index = ++index % 3"
  >
    {{ text }}
  </v-chip>
</template>

<script>
export default {
  props: {
    color: { default: '', type: String },
    outlined: { default: true, type: Boolean },
    value: { default: null, type: Object }
  },

  data: () => ({
    index: 0
  }),

  computed: {
    text() {
      const { index, value } = this

      switch (index) {
        case 1:
          return value.toISOString()
        case 2:
          return value.valueOf()
        default:
          return value.format('lll')
      }
    }
  }
}
</script>

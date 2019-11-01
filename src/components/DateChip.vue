<template>
  <v-chip
    v-if="value"
    :color="color"
    :small="small"
    outlined
    @click="index = ++index % 4"
  >
    {{ text }}
  </v-chip>
</template>

<script>
import moment from 'moment'

export default {
  props: {
    color: { default: '', type: String },
    small: { default: false, type: Boolean },
    value: { default: null, type: Object }
  },

  data: () => ({
    index: 0
  }),

  computed: {
    text() {
      const { index, value } = this
      const m = typeof value === 'string' ? moment.utc(value) : value

      switch (index) {
        case 0:
          return m.format(this.$dateTimeFormats.y4md_hm24utc)
        case 1:
          return m.format(this.$dateTimeFormats.m3dy_hm24utc)
        case 2:
          return m.toISOString()
        case 3:
          return m.valueOf()
        default:
          return ''
      }
    }
  }
}
</script>

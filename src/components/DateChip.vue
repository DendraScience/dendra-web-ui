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
    timeZone: { default: 'UTC', type: String },
    utcOffset: { default: 0, type: Number },
    value: { default: null, type: [Number, Object, String] }
  },

  data: () => ({
    index: 0
  }),

  computed: {
    text() {
      const { index, timeZone, utcOffset, value } = this
      const m = moment.utc(value)

      switch (index) {
        case 0:
          return m.format(`${this.$dateTimeFormats.y4md_hm24} [${timeZone}]`)
        case 1:
          return m.format(`${this.$dateTimeFormats.m3dy_hm24} [${timeZone}]`)
        case 2:
          return m.add(-utcOffset, 's').toISOString()
        case 3:
          return m.add(-utcOffset, 's').valueOf()
        default:
          return ''
      }
    }
  }
}
</script>

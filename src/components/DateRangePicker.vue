<template>
  <v-container fluid grid-list-lg pt-0>
    <v-layout>
      <v-flex>
        <h3>
          Begins at Jun 5, 2008 12:00 AM and affects all datapoints thereafter
        </h3>
      </v-flex>
    </v-layout>

    <v-layout align-center justify-center row wrap>
      <v-flex shrink>
        <v-checkbox v-model="fromEnabled" label="From date"></v-checkbox>

        <v-date-picker
          :disabled="!fromEnabled"
          :value="from"
          no-title
          @input="$emit('input', { from: $event, to: value.to })"
        ></v-date-picker>

        <v-text-field
          v-model="fromTime"
          v-validate="{ regex: $dateFormats.timeRegex }"
          :disabled="!fromEnabled"
          :error-messages="errors.collect('fromTime')"
          class="mt-2"
          clearable
          data-vv-name="fromTime"
          label="From time"
          placeholder="h:mm aa"
          prepend-inner-icon="access_time"
          solo
        ></v-text-field>
      </v-flex>

      <v-flex shrink>
        <v-checkbox v-model="toEnabled" label="To date"></v-checkbox>

        <v-date-picker
          :disabled="!toEnabled"
          :value="to"
          no-title
          @input="$emit('input', { from: value.from, to: $event })"
        ></v-date-picker>

        <v-text-field
          v-model="toTime"
          v-validate="{ regex: $dateFormats.timeRegex }"
          :disabled="!toEnabled"
          :error-messages="errors.collect('toTime')"
          class="mt-2"
          clearable
          data-vv-name="toTime"
          label="To time"
          placeholder="h:mm aa"
          prepend-inner-icon="access_time"
          solo
        ></v-text-field>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import moment from 'moment'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  props: {
    value: { type: Object, required: true }
  },

  data: () => ({
    fromEnabled: true,
    fromTime: null,

    toEnabled: true,
    toTime: null
  }),

  computed: {
    from() {
      // Ensure that Vuetify's Date Picker has a valid date
      const fmt = this.$dateFormats.y4md
      const m = moment(this.value.from, fmt, true)
      return this.fromEnabled && m.isValid() ? m.format(fmt) : null
    },

    to() {
      // Ensure that Vuetify's Date Picker has a valid date
      const fmt = this.$dateFormats.y4md
      const m = moment(this.value.to, fmt, true)
      return this.toEnabled && m.isValid() ? m.format(fmt) : null
    }
  }
}
</script>

<template>
  <v-container fluid pa-0>
    <v-layout row wrap>
      <v-flex xs12 sm6>
        <v-text-field
          v-model="value.from"
          v-validate="{ moment_format: $dateFormats.y4md, required: true }"
          :error-messages="errors.collect('fromDate')"
          append-icon="event"
          box
          data-vv-name="fromDate"
          label="From date"
          required
          @click:append="showDialog"
        ></v-text-field>
      </v-flex>

      <v-flex xs12 sm6>
        <v-text-field
          v-model="value.to"
          v-validate="{ moment_format: $dateFormats.y4md, required: true }"
          :error-messages="errors.collect('toDate')"
          append-icon="event"
          box
          data-vv-name="toDate"
          label="To date"
          required
          @click:append="showDialog"
        ></v-text-field>
      </v-flex>
    </v-layout>

    <v-dialog v-model="dialog" lazy max-width="680">
      <v-card>
        <v-card-title primary-title class="headline grey lighten-4 mb-3"
          >Date range</v-card-title
        >

        <date-range-picker v-model="dateRange" />

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn flat color="primary" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import DateRangePicker from '@/components/DateRangePicker'

import moment from 'moment'

export default {
  components: {
    DateRangePicker
  },

  inject: ['$validator'],

  props: {
    value: { type: Object, required: true }
  },

  data: () => ({
    dialog: false,

    dateRange: {
      from: null,
      to: null
    }
  }),

  computed: {},

  watch: {
    dateRange: {
      handler(newValue) {
        this.$emit('input', {
          from: newValue.from,
          to: newValue.to
        })
      },
      deep: true
    }
  },

  methods: {
    showDialog() {
      const { dateRange, value } = this
      const from = value.from && moment(value.from)
      const to = value.to && moment(value.to)

      dateRange.from =
        from && from.isValid() ? from.format(this.$dateFormats.y4md) : null
      dateRange.to =
        to && to.isValid() ? to.format(this.$dateFormats.y4md) : null

      this.dialog = true
    }
  }
}
</script>

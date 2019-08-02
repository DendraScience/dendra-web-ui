<template>
  <v-container fluid pa-0>
    <v-layout wrap>
      <v-flex xs12 sm6>
        <v-text-field
          v-model="value.from"
          v-validate="{ moment_format: $dateFormats.y4md, required: true }"
          :error-messages="errors.collect('fromDate')"
          append-icon="event"
          data-vv-name="fromDate"
          filled
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
          data-vv-name="toDate"
          filled
          label="To date"
          required
          @click:append="showDialog"
        ></v-text-field>
      </v-flex>
    </v-layout>

    <v-dialog v-model="dialog" max-width="680">
      <v-card>
        <v-card-title class="headline grey lighten-4 mb-4"
          >Date range</v-card-title
        >

        <date-range-picker v-model="dateRange" />

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn text color="primary" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import moment from 'moment'
import DateRangePicker from '@/components/DateRangePicker'

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

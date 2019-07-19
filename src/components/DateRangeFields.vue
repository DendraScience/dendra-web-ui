<template>
  <v-container fluid pa-0>
    <v-layout row wrap>
      <v-flex xs12 sm6>
        <v-text-field
          v-model="fromDate"
          v-validate="'required|date_format:yyyy-MM-dd'"
          :error-messages="errors.collect('fromDate')"
          append-icon="event"
          box
          data-vv-name="fromDate"
          label="From date"
          required
          @click:append="dialog = true"
        ></v-text-field>
      </v-flex>

      <v-flex xs12 sm6>
        <v-text-field
          v-model="toDate"
          v-validate="'required|date_format:yyyy-MM-dd'"
          :error-messages="errors.collect('toDate')"
          append-icon="event"
          box
          data-vv-name="toDate"
          label="To date"
          required
          @click:append="dialog = true"
        ></v-text-field>
      </v-flex>
    </v-layout>

    <v-dialog v-model="dialog" lazy max-width="680">
      <v-card>
        <v-card-title class="headline">Date range</v-card-title>

        <date-range-picker :value="value" @input="setFields($event)" />

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

    fromDate: null,
    toDate: null
  }),

  watch: {
    fromDate(newValue) {
      this.$emit('input', {
        from: newValue,
        to: this.toDate
      })
    },

    toDate(newValue) {
      this.$emit('input', {
        from: this.fromDate,
        to: newValue
      })
    }
  },

  mounted() {
    this.setFields(this.value)
  },

  methods: {
    setFields(value) {
      this.fromDate = value.from
      this.toDate = value.to
    }
  }
}
</script>

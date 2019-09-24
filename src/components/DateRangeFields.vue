<template>
  <v-container fluid pa-0>
    <v-layout wrap>
      <v-flex xs12 sm6>
        <ValidationProvider
          v-slot="{ errors }"
          name="from date"
          :rules="{ moment_format: $dateFormats.y4md, required: true }"
        >
          <v-text-field
            v-model="value.from"
            :error-messages="errors"
            append-icon="event"
            filled
            label="From date"
            required
            @click:append="showDialog"
          ></v-text-field>
        </ValidationProvider>
      </v-flex>

      <v-flex xs12 sm6>
        <ValidationProvider
          v-slot="{ errors }"
          name="to date"
          :rules="{ moment_format: $dateFormats.y4md, required: true }"
        >
          <v-text-field
            v-model="value.to"
            :error-messages="errors"
            append-icon="event"
            filled
            label="To date"
            required
            @click:append="showDialog"
          ></v-text-field>
        </ValidationProvider>
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
import { ValidationProvider } from 'vee-validate'
import DateRangePicker from '@/components/DateRangePicker'

export default {
  components: {
    DateRangePicker,
    ValidationProvider
  },

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

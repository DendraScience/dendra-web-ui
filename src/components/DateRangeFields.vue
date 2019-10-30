<template>
  <v-container fluid pa-0>
    <v-layout wrap>
      <v-flex xs12 sm6>
        <ValidationProvider
          v-slot="{ errors }"
          name="from date"
          :rules="{ date_format: dateFormat, required: true }"
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
          :rules="{ date_format: dateFormat, required: true }"
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
        <v-card-title class="headline primary white--text"
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
import { ValidationProvider } from 'vee-validate'
import DateRangePicker from '@/components/DateRangePicker'
import { newDateRange, updateDateRange } from '@/lib/date'

export default {
  components: {
    DateRangePicker,
    ValidationProvider
  },

  props: {
    dateFormat: { default: 'y4md', type: String },
    value: { type: Object, required: true }
  },

  data: () => ({
    dialog: false,
    dateRange: newDateRange()
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
      updateDateRange(this.dateRange, this.value)

      this.dialog = true
    }
  }
}
</script>

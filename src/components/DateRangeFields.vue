<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="6">
        <ValidationProvider
          v-slot="{ errors }"
          name="from date"
          :rules="{ date_format: dateFormat, required }"
        >
          <v-text-field
            v-model="value.from"
            :append-icon="mdiCalendar"
            :error-messages="errors"
            :required="required"
            filled
            label="From date"
            @click:append="showDialog"
          ></v-text-field>
        </ValidationProvider>
      </v-col>

      <v-col cols="12" md="6">
        <ValidationProvider
          v-slot="{ errors }"
          name="to date"
          :rules="{ date_format: dateFormat, required }"
        >
          <v-text-field
            v-model="value.to"
            :append-icon="mdiCalendar"
            :error-messages="errors"
            :required="required"
            filled
            label="To date"
            @click:append="showDialog"
          ></v-text-field>
        </ValidationProvider>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="680">
      <v-card>
        <v-card-title class="headline primary white--text"
          >Date range</v-card-title
        >

        <date-range-picker
          v-model="dateRange"
          :optional="required ? false : 'both'"
        />

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
    required: { default: true, type: Boolean },
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
          from: newValue.fromEnabled === false ? null : newValue.from,
          to: newValue.toEnabled === false ? null : newValue.to
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

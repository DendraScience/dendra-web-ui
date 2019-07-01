<template>
  <v-container fluid pa-0>
    <v-dialog ref="dialog" v-model="dialog" lazy max-width="680">
      <v-card>
        <v-card-title class="headline">Date range</v-card-title>

        <v-container grid-list-lg>
          <v-layout align-center justify-center row wrap>
            <v-flex shrink>
              <v-date-picker v-model="value.from" no-title></v-date-picker>
            </v-flex>

            <v-flex shrink>
              <v-date-picker v-model="value.to" no-title></v-date-picker>
            </v-flex>
          </v-layout>
        </v-container>

        <v-card-actions>
          <v-spacer />
          <v-btn flat color="primary" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-layout row wrap>
      <v-flex xs12 sm6>
        <v-text-field
          v-model="value.from"
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
          v-model="value.to"
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
  </v-container>
</template>

<script>
export default {
  $_veeValidate: {
    validator: 'new'
  },

  props: {
    value: { type: Object, required: true }
  },

  data: () => ({
    dialog: false
  }),

  watch: {
    value() {
      this.$emit('input', this.value)
    }
  }
}
</script>

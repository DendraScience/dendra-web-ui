<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <v-checkbox
          v-if="optional"
          v-model="value.fromEnabled"
          :disabled="toDisabled && optional !== 'both'"
          class="mt-1"
          dense
          label="From date"
        ></v-checkbox>

        <ValidationProvider
          :rules="{
            required: value.fromEnabled
          }"
        >
          <v-date-picker
            v-model="value.from"
            :disabled="fromDisabled"
            :color="fromDisabled ? 'grey lighten-4' : 'success'"
            no-title
            width="100%"
          ></v-date-picker>
        </ValidationProvider>

        <ValidationProvider
          v-if="showTime"
          v-slot="{ errors }"
          name="from time"
          :rules="{
            time_format: timeFormat,
            required: value.fromEnabled
          }"
        >
          <v-text-field
            v-model="value.fromTime"
            :disabled="fromDisabled"
            :error-messages="errors"
            :placeholder="$timeFormats.hm24"
            :prepend-inner-icon="mdiClockOutline"
            class="my-2"
            hide-details
            label="From time"
            solo
          ></v-text-field>
        </ValidationProvider>
      </v-col>

      <v-col v-if="!hideTo">
        <v-checkbox
          v-if="optional"
          v-model="value.toEnabled"
          :disabled="fromDisabled && optional !== 'both'"
          class="mt-1"
          dense
          label="To date"
        ></v-checkbox>

        <ValidationProvider
          :rules="{
            required: value.toEnabled
          }"
        >
          <v-date-picker
            v-model="value.to"
            :disabled="toDisabled"
            :color="toDisabled ? 'grey lighten-4' : 'error'"
            no-title
            width="100%"
          ></v-date-picker>
        </ValidationProvider>

        <ValidationProvider
          v-if="showTime"
          v-slot="{ errors }"
          name="to time"
          :rules="{
            time_format: timeFormat,
            required: value.toEnabled
          }"
        >
          <v-text-field
            v-model="value.toTime"
            :disabled="toDisabled"
            :error-messages="errors"
            :placeholder="$timeFormats.hm24"
            :prepend-inner-icon="mdiClockOutline"
            class="my-2"
            hide-details
            label="To time"
            solo
          ></v-text-field>
        </ValidationProvider>
      </v-col>
    </v-row>

    <v-row v-if="$scopedSlots.footer">
      <v-col>
        <slot name="footer" :value="value" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ValidationProvider } from 'vee-validate'

export default {
  components: {
    ValidationProvider
  },

  props: {
    hideTo: { default: false, type: Boolean },
    optional: { default: false, type: [Boolean, String] },
    showTime: { default: false, type: Boolean },
    timeFormat: { default: 'hm24', type: String },
    value: { type: Object, required: true }
  },

  computed: {
    fromDisabled() {
      return this.optional && !this.value.fromEnabled
    },

    toDisabled() {
      return this.optional && !this.value.toEnabled
    }
  }
}
</script>

<template>
  <v-container fluid grid-list-md>
    <v-layout align-center justify-center wrap>
      <v-flex shrink>
        <v-checkbox
          v-if="nullable"
          v-model="value.fromEnabled"
          :disabled="toDisabled"
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
            class="mt-2"
            data-vv-name="fromTime"
            label="From time"
            placeholder="h:mm a"
            prepend-inner-icon="access_time"
            solo
          ></v-text-field>
        </ValidationProvider>
      </v-flex>

      <v-flex v-if="!hideTo" shrink>
        <v-checkbox
          v-if="nullable"
          v-model="value.toEnabled"
          :disabled="fromDisabled"
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
            class="mt-2"
            label="To time"
            placeholder="h:mm a"
            prepend-inner-icon="access_time"
            solo
          ></v-text-field>
        </ValidationProvider>
      </v-flex>
    </v-layout>

    <v-layout v-if="$scopedSlots.footer">
      <v-flex>
        <slot name="footer" :value="value" />
      </v-flex>
    </v-layout>
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
    nullable: { default: false, type: Boolean },
    showTime: { default: false, type: Boolean },
    timeFormat: { default: 'hm12', type: String },
    value: { type: Object, required: true }
  },

  computed: {
    fromDisabled() {
      return this.nullable && !this.value.fromEnabled
    },

    toDisabled() {
      return this.nullable && !this.value.toEnabled
    }
  }
}
</script>

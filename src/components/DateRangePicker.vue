<template>
  <v-container fluid grid-list-lg pt-1>
    <v-layout align-center justify-center wrap>
      <v-flex shrink>
        <v-checkbox
          v-if="nullable"
          v-model="value.fromEnabled"
          :disabled="toDisabled"
          label="From date"
        ></v-checkbox>

        <v-date-picker
          v-model="value.from"
          :disabled="fromDisabled"
          :color="fromDisabled ? 'grey lighten-4' : 'success'"
          no-title
        ></v-date-picker>

        <v-text-field
          v-if="showTime"
          v-model="value.fromTime"
          v-validate="{
            moment_format: $dateFormats.hm12,
            required: value.fromEnabled
          }"
          :disabled="fromDisabled"
          :error-messages="errors.collect('fromTime')"
          class="mt-2"
          data-vv-name="fromTime"
          label="From time"
          placeholder="h:mm a"
          prepend-inner-icon="access_time"
          solo
        ></v-text-field>
      </v-flex>

      <v-flex v-if="!hideTo" shrink>
        <v-checkbox
          v-if="nullable"
          v-model="value.toEnabled"
          :disabled="fromDisabled"
          label="To date"
        ></v-checkbox>

        <v-date-picker
          v-model="value.to"
          :disabled="toDisabled"
          :color="toDisabled ? 'grey lighten-4' : 'error'"
          no-title
        ></v-date-picker>

        <v-text-field
          v-if="showTime"
          v-model="value.toTime"
          v-validate="{
            moment_format: $dateFormats.hm12,
            required: value.toEnabled
          }"
          :disabled="toDisabled"
          :error-messages="errors.collect('toTime')"
          class="mt-2"
          data-vv-name="toTime"
          label="To time"
          placeholder="h:mm a"
          prepend-inner-icon="access_time"
          solo
        ></v-text-field>
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
export default {
  $_veeValidate: {
    validator: 'new'
  },

  props: {
    hideTo: { default: false, type: Boolean },
    nullable: { default: false, type: Boolean },
    showTime: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({}),

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

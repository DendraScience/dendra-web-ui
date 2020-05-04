<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <v-select
          v-model="value.timeZone"
          :items="timeZoneItems"
          :prepend-inner-icon="mdiMapClock"
          hide-details
          item-text="text"
          item-value="abbr"
          label="Time zone"
          solo
        ></v-select>
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
import { timeZoneItems } from '@/lib/time-zone'

export default {
  props: {
    value: { type: Object, required: true }
  },

  data: () => ({
    timeZoneItems
  })
}
</script>

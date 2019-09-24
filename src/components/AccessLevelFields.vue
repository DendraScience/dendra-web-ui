<template>
  <v-container fluid grid-list-lg>
    <v-layout column>
      <v-flex>
        <v-slider
          v-model="value.level"
          :max="accessLevelItems.length - 1"
          :tick-labels="accessLevelItems"
          step="1"
          ticks="always"
          tick-size="4"
        ></v-slider>
      </v-flex>

      <v-flex class="font-weight-medium">
        {{ description }}
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { accessLevelItems, accessLevelTexts } from '@/lib/access-level'

export default {
  props: {
    value: { type: Object, required: true }
  },

  data: () => ({ accessLevelItems }),

  computed: {
    description() {
      return accessLevelTexts[this.value.target][this.value.level]
    }
  }
}
</script>

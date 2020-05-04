<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-slider
          v-model="value.level"
          :max="accessLevelItems.length - 1"
          :tick-labels="accessLevelItems"
          step="1"
          ticks="always"
          tick-size="4"
        ></v-slider>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="font-weight-medium">
        <v-card outlined>
          <v-card-text class="body-1">
            {{ description }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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

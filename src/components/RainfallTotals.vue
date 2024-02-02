<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-container fluid>
            <v-row dense>
              <v-col class="headline"> Rainfall totals </v-col>
              <v-col align="end" cols="12" sm="4"><slot name="util" /></v-col>
            </v-row>

            <v-row dense>
              <v-col v-for="(item, index) in items" :key="index" cols="12" sm>
                <v-card class="fill-height" dark flat>
                  <v-card-title class="subtitle-2">
                    {{ item.name }}
                  </v-card-title>

                  <v-card-text class="text-h5">
                    {{ item.value | round('', 0) }}
                    <small class="font-weight-light">{{
                      item.unit && item.unit.text
                    }}</small>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import rainfallTotals from '@/mixins/rainfall-totals'

export default {
  mixins: [rainfallTotals]
}
</script>

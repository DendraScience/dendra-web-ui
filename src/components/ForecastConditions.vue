<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-container fluid>
            <v-row dense>
              <v-col class="headline"> NOAA forecast </v-col>
              <v-col align="end" cols="12" sm="4"><slot name="util" /></v-col>
            </v-row>

            <v-row dense>
              <v-col v-for="(item, index) in items" :key="index" cols="12" sm>
                <v-card outlined>
                  <v-container fluid>
                    <v-row>
                      <v-col align="center">
                        <h5 class="subtitle-2 mb-2">
                          {{ item.name }}
                        </h5>
                      </v-col>
                    </v-row>

                    <v-row style="height: 180px">
                      <v-col v-if="hasDay(item)" align="center">
                        <v-img
                          :src="iconURL(item.day.conditionsIcon.url)"
                          width="55"
                        />

                        <p class="body-2 mt-2">
                          {{ item.day.weather.summary }}<br />
                          <span class="body-2 red--text">
                            High
                            {{ item.day.temperatureMaximum | round('', 4) }}
                            <sup>{{ units.temperature.text }}</sup>
                          </span>
                        </p>
                      </v-col>
                    </v-row>

                    <v-row style="height: 180px">
                      <v-col v-if="hasNight(item)" align="center">
                        <v-img
                          :src="iconURL(item.night.conditionsIcon.url)"
                          width="55"
                        />

                        <p class="body-2 mt-2">
                          {{ item.night.weather.summary }}<br />
                          <span class="body-2 blue--text">
                            Low
                            {{ item.night.temperatureMinimum | round('', 4) }}
                            <sup>{{ units.temperature.text }}</sup>
                          </span>
                        </p>
                      </v-col>
                    </v-row>
                  </v-container>
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
import forecastConditions from '@/mixins/forecast-conditions'

export default {
  mixins: [forecastConditions]
}
</script>

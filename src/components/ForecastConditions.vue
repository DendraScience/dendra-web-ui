<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col cols="12">
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
                    <v-row no-gutters>
                      <v-col align="center">
                        <h5 class="subtitle-2 mb-2">
                          {{ item.name }}
                        </h5>
                      </v-col>
                    </v-row>

                    <v-row style="height: 180px">
                      <v-col
                        v-if="
                          item.day &&
                          item.day.conditionsIcon &&
                          item.day.conditionsIcon.url &&
                          item.day.weather &&
                          item.day.weather.summary &&
                          item.day.temperatureMaximum !== undefined
                        "
                        align="center"
                      >
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
                      <v-col
                        v-if="
                          item.night &&
                          item.night.conditionsIcon &&
                          item.night.conditionsIcon.url &&
                          item.night.weather &&
                          item.night.weather.summary &&
                          item.night.temperatureMinimum !== undefined
                        "
                        align="center"
                      >
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
import _set from 'lodash/set'
import moment from 'moment'

const WEEKDAYS = moment.weekdays()

export default {
  props: {
    units: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  computed: {
    items() {
      const { value } = this
      const bins = {}

      Object.keys(value).forEach(key => {
        const keyedValue = value[key]

        if (!keyedValue) return

        const { data } = keyedValue

        data.forEach(item => {
          const date = new Date(item[0])
          const path = date.toISOString().substring(0, 10)
          const name = WEEKDAYS[date.getUTCDay()]

          _set(bins, `${path}.name`, name)

          _set(
            bins,
            `${path}.${date.getUTCHours() >= 18 ? 'night' : 'day'}.${key}`,
            item[1]
          )
        })
      })

      return Object.keys(bins)
        .sort()
        .map(key => bins[key])
    }
  },

  methods: {
    iconURL(value) {
      if (value) {
        const parts = value.split('/')
        if (parts.length > 0)
          return `${process.env.noaaNWSIcons}/${parts[parts.length - 1]}`
      }
    }
  }
}
</script>

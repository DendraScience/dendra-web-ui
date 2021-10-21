<template>
  <v-simple-table :height="height" dense fixed-header>
    <template #default>
      <thead>
        <tr>
          <th
            v-if="items.length"
            :class="headerClass"
            class="text-uppercase"
            colspan="3"
          >
            NOAA forecast
          </th>
          <th v-else :class="headerClass" colspan="3">
            Sorry, no forecast data
          </th>
          <th :class="headerClass" class="text-right" colspan="2">
            <slot name="util" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="index">
          <th>{{ item.name }}</th>
          <td width="40" style="padding: 0 8px">
            <v-img
              v-if="hasDay(item)"
              :src="iconURL(item.day.conditionsIcon.url)"
              width="30"
            />
          </td>
          <td style="padding: 0 8px">
            <div v-if="hasDay(item)" class="body-2">
              {{ item.day.weather.summary }}<br />
              <span class="red--text">
                High
                {{ item.day.temperatureMaximum | round('', 4) }}
                <sup>{{ units.temperature.text }}</sup>
              </span>
            </div>
          </td>
          <td width="40" style="padding: 0 8px">
            <v-img
              v-if="hasNight(item)"
              :src="iconURL(item.night.conditionsIcon.url)"
              width="30"
            />
          </td>
          <td style="padding: 0 8px">
            <div v-if="hasNight(item)" class="body-2">
              {{ item.night.weather.summary }}<br />
              <span class="blue--text">
                Low
                {{ item.night.temperatureMinimum | round('', 4) }}
                <sup>{{ units.temperature.text }}</sup>
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import forecastConditions from '@/mixins/forecast-conditions'

export default {
  mixins: [forecastConditions],

  props: {
    dark: { default: false, type: Boolean },
    height: { default: 100, type: Number }
  },

  computed: {
    headerClass() {
      return this.dark ? 'grey darken-3 white--text' : 'grey lighten-3'
    }
  }
}
</script>

<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline" cols="12" sm="8">
          <slot>Current conditions</slot>
        </v-col>

        <v-col align="end" cols="12" sm="4"><slot name="util"/></v-col>
      </v-row>

      <v-row dense>
        <v-col>
          <v-data-table
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="items"
            disable-pagination
            disable-sort
            hide-default-footer
            item-key="key"
          >
            <template v-slot:item.lastSeenTime="{ item }">
              {{ item.lastSeenTime | dateTimeFormatLocal('(no data)') }}
            </template>

            <template v-slot:item.datastream.name="{ item }">
              <nuxt-link
                v-if="item.datastream"
                :to="{
                  name: 'orgs-orgSlug-datastreams-datastreamId',
                  params: {
                    orgSlug: org.slug,
                    datastreamId: item.datastream._id
                  }
                }"
                >{{ item.datastream.name }}</nuxt-link
              >
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import math from '@/lib/math'

export default {
  props: {
    datastreamsByKey: { default: null, type: Object },
    org: { default: null, type: Object },
    units: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    headers: [
      {
        align: 'left',
        text: 'Measurement',
        value: 'name',
        width: '20%'
      },
      {
        align: 'right',
        text: 'Value',
        value: 'value',
        width: '15%'
      },
      {
        align: 'left',
        text: 'Unit',
        value: 'unit.text',
        width: '10%'
      },
      {
        align: 'left',
        text: 'Datastream',
        value: 'datastream.name'
      },
      {
        align: 'left',
        text: 'Last seen',
        value: 'lastSeenTime',
        width: '20%'
      }
    ],

    measurements: [
      {
        datastreamKey: 'airTemperature',
        name: 'Air temperature',
        unitKey: 'temperature',
        valueKey: 'airTemperature'
      },
      {
        datastreamKey: 'relativeHumidity',
        name: 'Relative humidity',
        unitKey: 'relativeHumidity',
        valueKey: 'relativeHumidity'
      },
      {
        datastreamKey: 'barometricPressure',
        name: 'Barometric pressure',
        unitKey: 'barometricPressure',
        valueKey: 'barometricPressure'
      },
      {
        datastreamKey: 'barometricPressure',
        name: 'Mean sea-level pressure',
        unitKey: 'barometricPressure',
        valueKey: 'meanSeaLevelPressure'
      },
      {
        datastreamKey: 'par',
        name: 'PAR',
        unitKey: 'par',
        valueKey: 'par'
      },
      {
        datastreamKey: 'solarRadiation',
        name: 'Total solar',
        unitKey: 'solarRadiation',
        valueKey: 'solarRadiation'
      },
      {
        datastreamKey: 'cumulativePrecipitation',
        name: "Today's rainfall",
        unitKey: 'precipitation',
        valueKey: 'rainfallToday'
      },
      {
        datastreamKey: 'cumulativePrecipitation',
        name: "Yesterday's rainfall",
        unitKey: 'precipitation',
        valueKey: 'rainfallYesterday'
      },
      {
        datastreamKey: 'cumulativePrecipitation',
        name: 'WY precipitation to date',
        unitKey: 'precipitation',
        valueKey: 'wyPrecipToDate'
      },
      {
        datastreamKey: 'airSpeedAverage',
        name: 'Wind speed',
        unitKey: 'speed',
        valueKey: 'windSpeed'
      }
    ]
  }),

  computed: {
    items() {
      const { datastreamsByKey, units, value } = this

      return this.measurements.map(measurement => {
        const { datastreamKey, unitKey, valueKey } = measurement
        const newMeasurement = Object.assign(
          {
            datastream: null,
            lastSeenTime: null,
            unitText: null,
            value: null
          },
          measurement
        )

        if (datastreamsByKey && datastreamsByKey[datastreamKey])
          newMeasurement.datastream = datastreamsByKey[datastreamKey]

        if (units && units[unitKey]) newMeasurement.unit = units[unitKey]

        if (value && value[valueKey]) {
          const last = value[valueKey]
          if (last.point !== undefined)
            newMeasurement.lastSeenTime = last.point.t
          if (last.value !== undefined)
            newMeasurement.value = math.round(last.value, 4)
        }

        return newMeasurement
      })
    }
  }
}
</script>

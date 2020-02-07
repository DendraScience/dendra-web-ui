<template>
  <v-card>
    <v-card-title class="headline">
      <slot>Current conditions</slot>
    </v-card-title>

    <v-container fluid pt-0 px-4>
      <v-layout>
        <v-flex>
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
              {{ item.lastSeenTime | moment('(no data)', ['format', 'lll']) }}
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
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
export default {
  props: {
    datastreamsByKey: { default: null, type: Object },
    org: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    headers: [
      {
        align: 'left',
        text: 'Measurement',
        value: 'name',
        width: '30%'
      },
      {
        align: 'left',
        text: 'Value',
        value: 'value',
        width: '20%'
      },
      {
        align: 'left',
        text: 'Last seen',
        value: 'lastSeenTime',
        width: '20%'
      },
      {
        align: 'left',
        text: 'Datastream',
        value: 'datastream.name'
      }
    ],

    measurements: [
      {
        datastreamKey: 'airTemperature',
        name: 'Air temperature',
        valueKey: 'airTemperature'
      },
      {
        datastreamKey: 'relativeHumidity',
        name: 'Relative humidity',
        valueKey: 'relativeHumidity'
      },
      {
        datastreamKey: 'barometricPressure',
        name: 'Barometric pressure',
        valueKey: 'barometricPressure'
      },
      {
        datastreamKey: 'barometricPressure',
        name: 'Mean sea-level pressure',
        valueKey: 'meanSeaLevelPressure'
      },
      {
        datastreamKey: 'par',
        name: 'PAR',
        valueKey: 'par'
      },
      {
        datastreamKey: 'solarRadiation',
        name: 'Total solar',
        valueKey: 'solarRadiation'
      },
      {
        datastreamKey: 'cumulativePrecipitation',
        name: "Today's rainfall",
        valueKey: 'rainfallToday'
      },
      {
        datastreamKey: 'cumulativePrecipitation',
        name: "Yesterday's rainfall",
        valueKey: 'rainfallYesterday'
      },
      {
        datastreamKey: 'cumulativePrecipitation',
        name: 'WY precipitation to date',
        valueKey: 'wyPrecipToDate'
      },
      {
        datastreamKey: 'airSpeedAverage',
        name: 'Wind speed',
        valueKey: 'windSpeed'
      }
    ]
  }),

  computed: {
    items() {
      const { datastreamsByKey, value } = this

      return this.measurements.map(measurement => {
        const { datastreamKey, valueKey } = measurement
        const newMeasurement = Object.assign(
          {
            datastream: null,
            lastSeenTime: null,
            value: null
          },
          measurement
        )

        if (datastreamsByKey && datastreamsByKey[datastreamKey])
          newMeasurement.datastream = datastreamsByKey[datastreamKey]

        if (value && value[valueKey]) {
          const last = value[valueKey]
          if (last.point !== undefined)
            newMeasurement.lastSeenTime = last.point.t
          if (last.value !== undefined) newMeasurement.value = last.value
        }

        return newMeasurement
      })
    }
  }
}
</script>

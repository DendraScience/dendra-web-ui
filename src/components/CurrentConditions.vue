<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline" cols="12" sm="8">
          <slot>Current conditions</slot>
        </v-col>

        <v-col align="end" cols="12" sm="4"><slot name="util" /></v-col>
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
            item-key="valueKey"
          >
            <template #item.value="{ item }">
              <span v-if="item.unitKey === 'direction'"
                >({{ item.value | direction }}) {{ item.value }}</span
              >
              <span v-else>{{ item.value }} </span>
            </template>

            <template #item.lastSeenTime="{ item }">
              {{ item.lastSeenTime | dateTimeFormatLocal('(no data)') }}
            </template>

            <template #item.datastream.name="{ item }">
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
import currentConditions from '@/mixins/current-conditions'

export default {
  mixins: [currentConditions],

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
    ]
  })
}
</script>

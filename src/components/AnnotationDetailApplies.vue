<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline">
          <slot>Applies to</slot>
        </v-col>
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
            <template #item.type="{ item }" class="text-no-wrap px-0">
              <v-icon>{{ item.icon }}</v-icon>
            </template>

            <template #item.icons="{ item }" class="text-no-wrap">
              <v-icon
                v-if="editing && !item.custom"
                color="tertiary"
                @click="remove(item)"
                >{{ mdiMinusCircle }}</v-icon
              >
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <v-card-actions v-if="editing">
      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn color="primary" v-on="on">
            <v-icon>{{ mdiPlus }}</v-icon>
          </v-btn>
        </template>

        <v-list two-line subheader>
          <v-list-item
            v-for="(item, index) in addItems"
            :key="index"
            @click="add(item)"
          >
            <v-list-item-avatar>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.subtitle }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<script>
import _uniq from 'lodash/uniq'
import { mapActions, mapGetters } from 'vuex'
import itemEditing from '@/mixins/item-editing'
import { mdiNature, mdiChartTimelineVariant } from '@mdi/js'

export default {
  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    addItems: [
      {
        icon: mdiNature,
        subtitle: 'Apply to ALL datastreams for selected stations.',
        target: 'station',
        title: 'Station'
      },
      {
        icon: mdiChartTimelineVariant,
        subtitle: 'Apply to selected datastreams.',
        target: 'datastream',
        title: 'Datastream'
      }
    ],

    headers: [
      {
        align: 'center',
        value: 'type',
        width: '50px'
      },
      {
        align: 'left',
        text: 'Station',
        value: 'station',
        width: '20%'
      },
      {
        align: 'left',
        text: 'Datastream',
        value: 'datastream',
        width: '40%'
      },
      {
        align: 'right',
        value: 'icons'
      }
    ]
  }),

  async fetch() {
    const datastreamIds = this.datastreamIds
    const stationIds = this.stationIds.slice()

    // Fetch referenced datastreams
    if (datastreamIds.length) {
      const res = await this.fetchDatastreams({
        query: {
          _id: { $in: datastreamIds },
          $limit: 2000,
          $select: ['_id', 'name', 'station_id']
        }
      })

      if (res && res.data && res.data.length)
        res.data.forEach(item => stationIds.push(item.station_id))
    }

    // Fetch referenced stations
    if (stationIds.length) {
      await this.fetchStations({
        query: {
          _id: { $in: _uniq(stationIds) },
          $limit: 2000,
          $select: ['_id', 'name']
        }
      })
    }
  },

  computed: {
    ...mapGetters({
      getDatastream: 'datastreams/get',
      getStation: 'stations/get'
    }),

    datastreamIds() {
      return this.value.datastream_ids
    },

    stationIds() {
      return this.value.station_ids
    },

    items() {
      return this.stationIds
        .map(id => {
          const station = this.getStation(id)

          return {
            datastream: 'All datastreams',
            icon: mdiNature,
            id,
            key: `station-${id}`,
            station: station ? station.name : id,
            target: 'station'
          }
        })
        .concat(
          this.datastreamIds.map(id => {
            const datastream = this.getDatastream(id)
            const station = datastream && this.getStation(datastream.station_id)

            return {
              datastream: datastream ? datastream.name : id,
              icon: mdiChartTimelineVariant,
              id,
              key: `datastream-${id}`,
              station: station ? station.name : id,
              target: 'datastream'
            }
          })
        )
    }
  },

  methods: {
    ...mapActions({
      fetchDatastreams: 'datastreams/find',
      fetchStations: 'stations/find'
    })
  }
}
</script>

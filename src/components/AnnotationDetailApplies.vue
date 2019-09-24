<template>
  <v-card>
    <v-card-title class="headline">
      <slot>Applies to</slot>
    </v-card-title>

    <v-container fluid pt-0>
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
            <template v-slot:item.type="{ item }" class="text-no-wrap px-0">
              <v-icon>{{ item.icon }}</v-icon>
            </template>

            <template v-slot:item.icons="{ item }" class="text-no-wrap">
              <v-icon
                v-if="editing && !item.custom"
                color="tertiary"
                @click="remove(item)"
                >mdi-minus-circle</v-icon
              >
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>

    <v-card-actions v-if="editing">
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" v-on="on">
            <v-icon>add</v-icon>
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

export default {
  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    addItems: [
      {
        icon: 'mdi-nature',
        subtitle: 'Apply to ALL datastreams for selected stations.',
        target: 'station',
        title: 'Station'
      },
      {
        icon: 'mdi-chart-timeline-variant',
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
            icon: 'mdi-nature',
            id,
            key: `station-${id}`,
            station: station ? station.name : id,
            target: 'station'
          }
        })
        .concat(
          this.datastreamIds.map(id => {
            const datastream = this.getDatastream(id)
            const station = datastream && datastream.station

            return {
              datastream: datastream ? datastream.name : id,
              icon: 'mdi-chart-timeline-variant',
              id,
              key: `datastream-${id}`,
              station: station ? station.name : id,
              target: 'datastream'
            }
          })
        )
    }
  },

  mounted() {
    this.fetch()
  },

  methods: {
    ...mapActions({
      fetchDatastreams: 'datastreams/find',
      fetchStations: 'stations/find'
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
    }
  }
}
</script>

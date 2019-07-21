<template>
  <v-card>
    <v-card-title primary-title class="headline">
      <slot>Applies to</slot>
    </v-card-title>

    <v-container fluid pt-0>
      <v-layout row wrap>
        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="items"
            disable-initial-sort
            hide-actions
            item-key="key"
          >
            <template v-slot:items="{ item }">
              <td class="text-xs-center text-no-wrap px-0">
                <v-icon>{{ item.icon }}</v-icon>
              </td>

              <td>{{ item.station }}</td>
              <td>{{ item.datastream }}</td>

              <td class="text-xs-right text-no-wrap">
                <v-icon v-if="editing" color="tertiary" @click="remove(item)"
                  >remove_circle</v-icon
                >
              </td>
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
          <v-list-tile
            v-for="(item, index) in addItems"
            :key="index"
            @click="add(item)"
          >
            <v-list-tile-avatar>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<script>
import _uniq from 'lodash/uniq'

import { mapActions, mapGetters } from 'vuex'

export default {
  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    addItems: [
      {
        icon: 'nature',
        target: 'station',
        title: 'Station',
        subtitle: 'Apply to ALL datastreams for a station.'
      },
      {
        icon: 'timeline',
        target: 'datastream',
        title: 'Datastream',
        subtitle: 'Apply to a specific datastream only.'
      }
    ],

    headers: [
      {
        align: 'center',
        sortable: false,
        value: 'key',
        width: '10%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Station',
        value: 'station',
        width: '20%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Datastream',
        value: 'datastream',
        width: '40%'
      },
      {
        sortable: false,
        value: 'key'
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
            id,
            icon: 'nature',
            target: 'station',
            key: `station-${id}`,
            station: station ? station.name : id,
            datastream: 'All datastreams'
          }
        })
        .concat(
          this.datastreamIds.map(id => {
            const datastream = this.getDatastream(id)
            const station = datastream && datastream.station
            return {
              id,
              icon: 'timeline',
              target: 'datastream',
              key: `datastream-${id}`,
              station: station ? station.name : id,
              datastream: datastream ? datastream.name : id
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

    add(item) {
      this.$emit('add', item)
    },

    remove(item) {
      this.$emit('remove', item)
    },

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

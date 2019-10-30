<template>
  <v-card>
    <v-card-title class="headline">
      <slot>Derived from</slot>
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

      <v-layout v-if="items.length">
        <v-flex>
          <v-card outlined>
            <v-container fluid>
              <v-layout column>
                <v-flex>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="derived description"
                    rules="required|min:5|max:5000"
                  >
                    <v-textarea
                      v-model.trim="value.derivation_description"
                      :error-messages="errors"
                      :readonly="!editing"
                      auto-grow
                      label="Derivation description"
                      required
                    ></v-textarea>
                  </ValidationProvider>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="derived method"
                    :rules="{
                      regex: /^[A-Za-z][A-Za-z0-9]*$/,
                      required: true,
                      min: 1,
                      max: 100
                    }"
                  >
                    <v-text-field
                      v-model.trim="value.derivation_method"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Derivation method"
                      required
                    ></v-text-field>
                  </ValidationProvider>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-card-actions v-if="editing">
      <v-btn color="primary" @click="add">
        <v-icon>add</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import _uniq from 'lodash/uniq'
import { mapActions, mapGetters } from 'vuex'
import itemEditing from '@/mixins/item-editing'

export default {
  components: {
    ValidationProvider
  },

  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
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
      return this.value.derived_from_datastream_ids
    },

    items() {
      return this.datastreamIds.map(id => {
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
      const stationIds = []

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

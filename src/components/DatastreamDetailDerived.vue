<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline">
          <slot>Derived from</slot>
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

      <v-row v-if="items.length">
        <v-col>
          <v-card outlined>
            <v-container fluid>
              <v-row no-gutters>
                <v-col>
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
                      required: value.source_type === 'deriver',
                      min: 1,
                      max: 100
                    }"
                  >
                    <v-text-field
                      v-model.trim="value.derivation_method"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Derivation method"
                    ></v-text-field>
                  </ValidationProvider>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-card-actions v-if="editing">
      <v-btn color="primary" @click="add">
        <v-icon>{{ mdiPlus }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import _uniq from 'lodash/uniq'
import { mapActions, mapGetters } from 'vuex'
import { mdiChartTimelineVariant } from '@mdi/js'
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
  },

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

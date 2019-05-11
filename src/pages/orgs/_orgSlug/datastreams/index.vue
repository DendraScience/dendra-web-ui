<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout row>
          <v-flex xs12>
            <v-card>
              <v-card-title primary-title class="headline">
                Datastream browser
              </v-card-title>

              <v-container fluid>
                <feathers-vuex-find
                  :query="{
                    is_hidden: false,
                    organization_id: org._id,
                    station_type: 'weather',
                    $sort: { name: 1 }
                  }"
                  service="stations"
                >
                  <v-layout
                    slot-scope="{ isFindPending: loading, items: stations }"
                    row
                    wrap
                  >
                    <v-flex xs12>
                      <v-autocomplete
                        v-model="selectedStationIds"
                        :items="stations"
                        :label="loading ? 'Loading...' : 'Station'"
                        :loading="loading"
                        box
                        chips
                        clearable
                        deletable-chips
                        flat
                        hide-details
                        hide-no-data
                        item-text="name"
                        item-value="_id"
                        multiple
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                </feathers-vuex-find>

                <feathers-vuex-find
                  :query="{
                    is_hidden: false,
                    scheme_id: 'ds',
                    vocabulary_type: 'class',
                    $sort: { name: 1 }
                  }"
                  service="vocabularies"
                >
                  <v-layout slot-scope="{ items: vocabularies }" row wrap>
                    <v-flex
                      v-for="vocabulary in vocabularies"
                      :key="vocabulary._id"
                      xs12
                      md6
                    >
                      <v-autocomplete
                        v-model="selectedTermLabels[vocabulary.label]"
                        :items="vocabulary.terms"
                        :label="vocabulary.label"
                        :item-text="term => term.name || term.label"
                        box
                        chips
                        clearable
                        deletable-chips
                        flat
                        hide-details
                        hide-no-data
                        item-value="label"
                        multiple
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                </feathers-vuex-find>

                <feathers-vuex-find
                  :query="datastreamsQuery"
                  service="datastreams"
                  watch="query"
                >
                  <v-layout
                    slot-scope="{
                      isFindPending: loading,
                      items: datastreams,
                      pagination
                    }"
                    row
                    wrap
                  >
                    <v-flex xs12>
                      <v-data-table
                        v-model="selectedDatastreams"
                        :headers="datastreamsHeaders"
                        :items="datastreams"
                        :loading="loading"
                        :pagination.sync="datastreamsPagination"
                        :rows-per-page-items="[5, 10, 25, 50]"
                        :total-items="pagination ? pagination.total : 0"
                        disable-initial-sort
                        item-key="_id"
                        select-all
                      >
                        <template v-slot:items="props">
                          <td>
                            <v-checkbox
                              v-model="props.selected"
                              primary
                              hide-details
                            ></v-checkbox>
                          </td>
                          <td>{{ props.item.name }}</td>
                          <td>{{ props.item.description }}</td>
                          <td class="justify-center layout px-0">
                            <v-icon small class="mr-2">
                              info
                            </v-icon>
                            <v-icon small>
                              add
                            </v-icon>
                          </td>
                        </template>
                      </v-data-table>
                    </v-flex>
                  </v-layout>
                </feathers-vuex-find>
              </v-container>

              <v-card-actions>
                <v-btn :disabled="selectedDatastreams.length === 0" flat
                  >Graph Selected</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
// TODO: Remove
// import GoogleMap from '@/components/GoogleMap'
// import MediaPhoto from '@/components/MediaPhoto'
import timer from '@/mixins/timer'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {},

  middleware: ['check-org', 'dt-unit-vocabulary', 'system-time-utc'],

  mixins: [timer],

  data: () => ({
    datastreamsHeaders: [
      {
        align: 'left',
        sortable: false,
        text: 'Name',
        value: 'name'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Description',
        value: 'description'
      },
      {
        text: 'Actions',
        sortable: false,
        value: '_id'
      }
    ],
    datastreamsPagination: {
      descending: false,
      page: 1,
      rowsPerPage: 5,
      sortBy: null,
      totalItems: null
    },

    selectedDatastreams: [],
    selectedStationIds: null,
    selectedTermLabels: {},

    timerInterval: 60000
  }),

  computed: {
    ...mapGetters(['getUnitAbbr', 'org']),

    datastreamsQuery() {
      const {
        datastreamsPagination,
        selectedStationIds,
        selectedTermLabels
      } = this
      const { page, rowsPerPage } = datastreamsPagination

      const query = {
        is_hidden: false,
        organization_id: this.org._id,
        $limit: rowsPerPage,
        $skip: (page - 1) * rowsPerPage,
        $select: [
          '_id',
          'is_hidden',
          'name',
          'description',
          'organization_id',
          'station_id',
          'terms_info.class_tags'
        ],
        $sort: { name: 1 }
      }

      if (selectedStationIds && selectedStationIds.length)
        query.station_id = { $in: selectedStationIds }

      const tagExprs = []

      Object.keys(selectedTermLabels).forEach(vLabel => {
        const tags = selectedTermLabels[vLabel].map(
          tLabel => `ds_${vLabel}_${tLabel}`
        )
        if (tags.length)
          tagExprs.push({ 'terms_info.class_tags': { $in: tags } })
      })

      if (tagExprs.length) query.$and = tagExprs

      this.$logger.log('query', JSON.stringify(query))

      return query
    }
  },

  watch: {
    // TODO: Remove
    // datastreamsPagination: {
    //   handler() {
    //   },
    //   deep: true
    // },

    // TODO: Remove
    // selectedDatastreams() {
    // },

    selectedStationIds() {
      this.datastreamsPagination.page = 1
    },

    selectedTermLabels: {
      handler() {
        this.datastreamsPagination.page = 1
      },
      deep: true
    }
  },

  created() {
    const { query } = this.$route

    if (query && query.stationId) this.selectedStationIds = [query.stationId]
  },

  methods: {
    ...mapActions(['getSystemTimeUTC']),

    timerCallback() {
      return this.getSystemTimeUTC()
    }
  }
}
</script>

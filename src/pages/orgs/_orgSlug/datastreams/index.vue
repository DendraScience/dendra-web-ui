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
                  :fetch-query="datastreamsFetchQuery"
                  :query="datastreamsQuery"
                  :watch="[
                    'fetchQuery.$and',
                    'fetchQuery.$limit',
                    'fetchQuery.$skip',
                    'fetchQuery.$text',
                    'fetchQuery.station_id'
                  ]"
                  qid="browser"
                  service="datastreams"
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
                      <v-text-field
                        v-model.trim="datastreamsSearchDebounce"
                        append-icon="search"
                        label="Filter datastreams"
                        single-line
                        hide-details
                      ></v-text-field>
                    </v-flex>

                    <v-flex xs12>
                      <v-data-table
                        :headers="datastreamsHeaders"
                        :items="datastreams"
                        :loading="loading"
                        :pagination.sync="datastreamsPagination"
                        :rows-per-page-items="[5, 10, 25, 50]"
                        :total-items="pagination ? pagination.total : 0"
                        disable-initial-sort
                        item-key="_id"
                      >
                        <template v-slot:items="props">
                          <td class="text-xs-center">
                            <v-btn
                              color="primary"
                              fab
                              outline
                              small
                              @click="
                                flagDatastream({
                                  id: props.item._id,
                                  flags: ['Y1', 'Y2']
                                })
                              "
                            >
                              <span v-if="props.item.flag">{{
                                props.item.flag
                              }}</span>
                              <span v-else>&mdash;</span>
                            </v-btn>
                          </td>

                          <td>{{ props.item.name }}</td>
                          <td>{{ props.item.description }}</td>
                        </template>
                      </v-data-table>
                    </v-flex>
                  </v-layout>
                </feathers-vuex-find>
              </v-container>

              <v-card-actions>
                <v-btn :disabled="!flaggedDatastreamCount" color="primary"
                  >Graph
                  {{ flaggedDatastreamCount }}
                  {{ flaggedDatastreamCount | pluralize('Datastream') }}
                </v-btn>

                <v-btn
                  :disabled="!flaggedDatastreamCount"
                  @click="updateDatastreamsFlag()"
                  >Reset</v-btn
                >

                <v-menu offset-y>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on">
                      All
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-tile
                      @click="
                        updateDatastreamsFlag({
                          ids: queryDatastreamIds,
                          flag: 'Y1'
                        })
                      "
                    >
                      <v-list-tile-title>Y1 axis</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile
                      @click="
                        updateDatastreamsFlag({
                          ids: queryDatastreamIds,
                          flag: 'Y2'
                        })
                      "
                    >
                      <v-list-tile-title>Y2 axis</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile
                      @click="
                        updateDatastreamsFlag({ ids: queryDatastreamIds })
                      "
                    >
                      <v-list-tile-title>None</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
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
import _debounce from 'lodash/debounce'

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {},

  middleware: ['check-org', 'dt-unit-vocabulary', 'system-time-utc'],

  mixins: [timer],

  data: () => ({
    datastreamsHeaders: [
      {
        align: 'center',
        sortable: false,
        text: 'Axis',
        value: '_id'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Name',
        value: 'name',
        width: '40%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Description',
        value: 'description'
      }
    ],
    datastreamsPagination: {
      descending: false,
      page: 1,
      rowsPerPage: 5,
      sortBy: null,
      totalItems: null
    },
    datastreamsSearch: '',
    datastreamsSearchDebounce: '',

    queryDatastreamIds: [],

    selectedStationIds: null,
    selectedTermLabels: {},

    timerInterval: 60000
  }),

  computed: {
    ...mapGetters(['getUnitAbbr', 'org']),

    datastreamsFetchQuery() {
      const {
        datastreamsPagination,
        datastreamsSearch,
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
          'station_id'
        ],
        $sort: { name: 1 }
      }

      if (datastreamsSearch.length)
        query.$text = { $search: `${this.datastreamsSearch}` }

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

      return query
    },

    datastreamsPaginationBrowser() {
      return this.$store.state.datastreams.pagination.browser
    },

    datastreamsQuery() {
      return {
        _id: { $in: this.queryDatastreamIds },
        $sort: { name: 1 }
      }
    },

    flagsByDatastreamId() {
      return this.$store.state.flagsByDatastreamId
    },

    flaggedDatastreamCount() {
      return Object.keys(this.flagsByDatastreamId).length
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

    datastreamsPaginationBrowser(newValue) {
      this.queryDatastreamIds = newValue && newValue.ids
    },

    datastreamsSearchDebounce(newValue) {
      this.debouncedDatastreamsSearch(newValue)
    },

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

    this.debouncedDatastreamsSearch = _debounce(value => {
      this.datastreamsSearch = value
    }, 400)

    this.clearAllDatastreamFlags()
  },

  beforeDestroy() {
    this.debouncedDatastreamsSearch.cancel()
    this.debouncedDatastreamsSearch = null
  },

  methods: {
    ...mapActions(['getSystemTimeUTC', 'updateDatastreamsFlag']),

    ...mapMutations(['clearAllDatastreamFlags', 'flagDatastream']),

    timerCallback() {
      return this.getSystemTimeUTC()
    }
  }
}
</script>

<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <v-expansion-panels v-model="panel" focusable multiple>
          <v-expansion-panel>
            <v-expansion-panel-header>
              1. Narrow the list of datastreams
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-container fluid px-0>
                <v-row v-if="!indexer">
                  <v-col>
                    <v-progress-linear indeterminate></v-progress-linear>
                  </v-col>
                </v-row>

                <v-row v-else no-gutters>
                  <v-col v-if="!stationId && stations" cols="12" md="3" sm="6">
                    <v-list dense>
                      <v-subheader>Stations</v-subheader>
                      <v-list-item-group
                        v-model="selectedStations"
                        color="primary"
                        multiple
                      >
                        <v-list-item
                          v-for="(item, index) in stations"
                          :key="index"
                        >
                          <template v-slot:default="{ active }">
                            <v-list-item-action>
                              <v-checkbox
                                :input-value="active"
                                color="primary"
                              ></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                              <v-list-item-title
                                :class="
                                  !selectedStations.includes(index) &&
                                  !(
                                    facetCounts &&
                                    facetCounts.Station &&
                                    facetCounts.Station[item._id] > 0
                                  )
                                    ? 'grey--text'
                                    : 'dark--text'
                                "
                                >{{ item.name }}
                                <span class="secondary--text"
                                  >({{
                                    facetCounts | get(`Station.${item._id}`, 0)
                                  }})</span
                                ></v-list-item-title
                              >
                            </v-list-item-content>
                          </template>
                        </v-list-item>
                      </v-list-item-group>
                    </v-list>
                  </v-col>

                  <v-col
                    v-for="vocabulary in filteredVocabularies"
                    :key="vocabulary._id"
                    cols="12"
                    md="3"
                    sm="6"
                  >
                    <v-list dense>
                      <v-subheader>{{ vocabulary.label }}</v-subheader>
                      <v-list-item-group
                        v-model="selectedTerms[vocabulary._id]"
                        color="primary"
                        multiple
                      >
                        <v-list-item
                          v-for="(item, index) in vocabulary.terms"
                          :key="item.label"
                        >
                          <template v-slot:default="{ active }">
                            <v-list-item-action>
                              <v-checkbox
                                :input-value="active"
                                color="primary"
                              ></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                              <v-list-item-title
                                :class="
                                  !(
                                    selectedTerms[vocabulary._id] &&
                                    selectedTerms[vocabulary._id].includes(
                                      index
                                    )
                                  ) &&
                                  !(
                                    facetCounts &&
                                    facetCounts[vocabulary.label] &&
                                    facetCounts[vocabulary.label][item.label] >
                                      0
                                  )
                                    ? 'grey--text'
                                    : 'dark--text'
                                "
                                >{{ item.name || item.label }}
                                <span class="secondary--text"
                                  >({{
                                    facetCounts
                                      | get(
                                        `${vocabulary.label}.${item.label}`,
                                        0
                                      )
                                  }})</span
                                >
                              </v-list-item-title>
                            </v-list-item-content>
                          </template>
                        </v-list-item>
                      </v-list-item-group>
                    </v-list>
                  </v-col>
                </v-row>
              </v-container>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header>
              2. Select datastreams
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-container fluid px-0>
                <v-row dense>
                  <v-col>
                    <v-text-field
                      v-model.trim="search"
                      :append-icon="mdiMagnify"
                      filled
                      flat
                      label="Filter datastreams"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row dense>
                  <v-col>
                    <v-data-table
                      :footer-props="{
                        itemsPerPageOptions: [10, 50, 100]
                      }"
                      :headers="headers"
                      :hide-default-header="$vuetify.breakpoint.xsOnly"
                      :items="foundDatastreams"
                      :options.sync="tableOptions"
                      :search="search"
                      item-key="_id"
                      @current-items="$emit('current-items', $event)"
                    >
                      <template
                        v-if="$scopedSlots.select"
                        v-slot:item.select="{ item }"
                        class="text-no-wrap px-0"
                      >
                        <slot name="select" :item="item" />
                      </template>

                      <template v-slot:item.extent.begins_at="{ item }">
                        {{
                          item.extent &&
                          item.extent.begins_at
                            | dateTimeFormatExtra(
                              undefined,
                              undefined,
                              item.station_lookup.utc_offset,
                              item.station_lookup.time_zone
                            )
                        }}
                      </template>

                      <template v-slot:item.extent.ends_before="{ item }">
                        {{
                          item.extent &&
                          item.extent.ends_before
                            | dateTimeFormatExtra(
                              undefined,
                              undefined,
                              item.station_lookup.utc_offset,
                              item.station_lookup.time_zone
                            )
                        }}
                      </template>

                      <template v-slot:item.indicators="{ item }">
                        <indicator-cell :value="item" />
                      </template>

                      <template v-slot:item.icons="{ item }">
                        <span v-if="$scopedSlots.actions" class="text-no-wrap">
                          <slot name="actions" :item="item" />
                        </span>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
              </v-container>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _set from 'lodash/set'
import { mapActions, mapGetters, mapState } from 'vuex'
import { FacetIndexer } from '@/lib/facet-indexer'
import IndicatorCell from '@/components/IndicatorCell'

const dateSortPred = (a = '', b = '') => (a < b ? -1 : a > b ? 1 : 0)

export default {
  components: {
    IndicatorCell
  },

  props: {
    isEnabled: { default: null, type: [Boolean, String] },
    org: { default: null, type: Object },
    schemeId: { default: 'ds', type: String },
    selectStationId: { default: null, type: String },
    showDisabled: { default: false, type: Boolean },
    showLink: { default: false, type: Boolean },
    stationId: { default: null, type: String }
  },

  fetch() {
    this.fetchStations({
      paginate: false,
      query: this.stationsQuery
    }).then(res => (this.stations = res.data)) // Keep a stable-ordered local copy

    this.fetchVocabularies({ paginate: false, query: this.vocabulariesQuery })

    const fetchSpec = {
      orgId: this.org._id,
      schemeId: this.schemeId
    }

    if (this.isEnabled !== null) fetchSpec.isEnabled = this.isEnabled
    else if (!this.showDisabled) fetchSpec.isEnabled = true

    if (this.stationId) fetchSpec.stationId = this.stationId

    this.datastreamFacetWorker.postMessage({
      id: 0,
      fetchSpec
    })
  },

  data: () => ({
    headers: [
      {
        align: 'center',
        value: 'select',
        width: '50px'
      },
      {
        align: 'left',
        text: 'Station',
        value: 'station_lookup.name',
        width: '20%'
      },
      {
        align: 'left',
        text: 'Datastream',
        value: 'name'
      },
      {
        align: 'left',
        text: 'Unit',
        value: 'terms.dt.Unit',
        width: '10%'
      },
      {
        align: 'left',
        sort: dateSortPred,
        text: 'Begins at',
        value: 'extent.begins_at',
        width: '12%'
      },
      {
        align: 'left',
        sort: dateSortPred,
        text: 'Ends before',
        value: 'extent.ends_before',
        width: '12%'
      },
      {
        align: 'right',
        value: 'indicators',
        width: '5%'
      },
      {
        align: 'right',
        value: 'icons',
        width: '5%'
      }
    ],

    datastreamFacetWorker: null,

    indexer: null,
    datastreams: null,
    stations: null,

    facetCounts: null,
    facetKeys: null,
    facetQuery: {},

    panel: [0, 1],
    search: null,

    selectedStations: [],
    selectedTerms: {},

    tableOptions: {
      descending: false,
      page: 1,
      itemsPerPage: 50,
      totalItems: null
    }
  }),

  computed: {
    ...mapGetters({
      findVocabularies: 'vocabularies/find'
    }),
    ...mapState(['auth']),

    filteredVocabularies() {
      const { indexer, vocabulariesQuery } = this

      return this.findVocabularies({ query: vocabulariesQuery })
        .data.map(vocabulary => {
          return Object.assign({}, vocabulary, {
            terms: indexer
              ? vocabulary.terms.filter(term => {
                  const facet = indexer.facets[vocabulary.label]
                  return facet && facet[term.label]
                })
              : []
          })
        })
        .sort((a, b) => b.terms.length - a.terms.length)
    },

    foundDatastreams() {
      return this.facetKeys
        ? this.facetKeys.map(key => this.datastreams[key])
        : []
    },

    stationsQuery() {
      return this.showDisabled
        ? {
            is_hidden: false,
            organization_id: this.org._id,
            station_type: 'weather',
            $sort: { name: 1 }
          }
        : {
            is_enabled: true,
            is_hidden: false,
            organization_id: this.org._id,
            station_type: 'weather',
            $sort: { name: 1 }
          }
    },

    vocabulariesQuery() {
      return {
        is_enabled: true,
        is_hidden: false,
        $or: [
          {
            scheme_id: this.schemeId,
            vocabulary_type: 'class'
          },
          {
            scheme_id: 'dt',
            vocabulary_type: 'unit'
          }
        ]
      }
    }
  },

  watch: {
    facetQuery: {
      handler(value) {
        if (this.indexer) {
          const result = this.indexer.query(value)

          this.facetCounts = result.counts()
          this.facetKeys = result.keys()
        }
      },
      deep: true
    },

    selectedStations() {
      this.buildFacetQuery()
    },

    selectedTerms: {
      handler() {
        this.buildFacetQuery()
      },
      deep: true
    },

    stations(value) {
      const { selectStationId } = this
      if (selectStationId && value) {
        const index = value.findIndex(
          station => station._id === selectStationId
        )
        if (index > -1) this.selectedStations.push(index)
      }
    }
  },

  created() {
    this.datastreams = []

    this.datastreamFacetWorker = this.$workers.createDatastreamFacetWorker()
    this.datastreamFacetWorker.postMessage({
      accessToken: this.auth.accessToken,
      api: this.$api
    })
    // Handle HMR so we can debug
    // SEE: https://webpack.github.io/docs/hot-module-replacement.html
    if (module.hot) {
      this.datastreamFacetWorker.removeEventListener(
        'message',
        this.workerMessageHandler
      )
    }
    this.datastreamFacetWorker.addEventListener(
      'message',
      this.workerMessageHandler
    )
  },

  beforeDestroy() {
    this.datastreams = null
    this.stations = null
    this.indexer = null

    this.datastreamFacetWorker.removeEventListener(
      'message',
      this.workerMessageHandler
    )
    this.datastreamFacetWorker.terminate()
    this.datastreamFacetWorker = null
  },

  mounted() {
    let { headers } = this

    if (!this.$scopedSlots.select) headers = headers.slice(1)
    if (!this.$scopedSlots.actions) headers = headers.slice(0, -1)

    this.headers = headers
  },

  methods: {
    ...mapActions({
      fetchStations: 'stations/find',
      fetchVocabularies: 'vocabularies/find'
    }),

    apply() {
      const result = this.indexer.query(this.facetQuery)

      this.$nextTick(() => {
        this.facetCounts = result.counts()
      })

      this.$nextTick(() => {
        this.facetKeys = result.keys()
      })
    },

    buildFacetQuery() {
      const {
        filteredVocabularies,
        selectedStations,
        selectedTerms,
        stations
      } = this
      const query = {}

      selectedStations.forEach(index => {
        _set(query, `Station.${stations[index]._id}`, true)
      })

      Object.keys(selectedTerms).forEach(id => {
        const vocabulary = filteredVocabularies.find(vocab => vocab._id === id)

        selectedTerms[id].forEach(index => {
          _set(
            query,
            `${vocabulary.label}.${vocabulary.terms[index].label}`,
            true
          )
        })
      })

      this.facetQuery = query
    },

    workerMessageHandler(event) {
      if (!event.data.datastreams) return

      this.datastreams = event.data.datastreams
      this.indexer = new FacetIndexer(event.data.indexer)

      this.apply()

      // HACK: For faceted search
      this.$emit('datastreams', this.datastreams)
    }
  }
}
</script>

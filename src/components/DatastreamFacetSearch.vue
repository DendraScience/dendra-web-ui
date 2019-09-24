<template>
  <v-container fluid grid-list-lg>
    <v-layout>
      <v-flex>
        <v-expansion-panels v-model="panel" focusable multiple>
          <v-expansion-panel>
            <v-expansion-panel-header>
              1. Narrow the list of datastreams
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-container fluid>
                <v-layout wrap>
                  <v-flex v-if="!stationId && stations" xs12 sm6 md3>
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
                          :disabled="
                            !selectedStations.includes(index) &&
                              !(
                                facetCounts &&
                                facetCounts.Station &&
                                facetCounts.Station[item._id] > 0
                              )
                          "
                        >
                          <template v-slot:default="{ active, toggle }">
                            <v-list-item-action>
                              <v-checkbox
                                v-model="active"
                                color="primary"
                                @click="toggle"
                              ></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                              <v-list-item-title
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
                  </v-flex>

                  <v-flex
                    v-for="vocabulary in filteredVocabularies"
                    :key="vocabulary._id"
                    xs12
                    sm6
                    md3
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
                          :disabled="
                            !(
                              selectedTerms[vocabulary._id] &&
                              selectedTerms[vocabulary._id].includes(index)
                            ) &&
                              !(
                                facetCounts &&
                                facetCounts[vocabulary.label] &&
                                facetCounts[vocabulary.label][item.label] > 0
                              )
                          "
                        >
                          <template v-slot:default="{ active, toggle }">
                            <v-list-item-action>
                              <v-checkbox
                                v-model="active"
                                color="primary"
                                @click="toggle"
                              ></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                              <v-list-item-title
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
                  </v-flex>
                </v-layout>
              </v-container>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header>
              2. Select datastreams
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-container fluid>
                <v-layout wrap>
                  <v-flex xs12>
                    <v-text-field
                      v-model.trim="search"
                      append-icon="search"
                      flat
                      label="Filter datastreams"
                    ></v-text-field>
                  </v-flex>

                  <v-flex xs12>
                    <v-data-table
                      :footer-props="{
                        itemsPerPageOptions: [10, 50, 100, 500]
                      }"
                      :headers="headers"
                      :hide-default-header="$vuetify.breakpoint.xsOnly"
                      :items="foundDatastreams"
                      :options.sync="tableOptions"
                      :search="search"
                      item-key="_id"
                    >
                      <template
                        v-if="$scopedSlots.select"
                        v-slot:item.select="{ item }"
                        class="text-no-wrap px-0"
                      >
                        <slot name="select" :item="item" />
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
                  </v-flex>
                </v-layout>
              </v-container>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import _set from 'lodash/set'
import { mapActions, mapGetters, mapState } from 'vuex'
import { FacetIndexer } from '@/lib/facet-indexer'
import IndicatorCell from '@/components/IndicatorCell'

export default {
  components: {
    IndicatorCell
  },

  props: {
    isEnabled: { default: null, type: [Boolean, String] },
    org: { default: null, type: Object },
    schemeId: { default: 'ds', type: String },
    showDisabled: { default: false, type: Boolean },
    showLink: { default: false, type: Boolean },
    stationId: { default: null, type: String }
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
        value: 'name',
        width: '30%'
      },
      {
        align: 'left',
        text: 'Unit',
        value: 'terms.dt.Unit',
        width: '10%'
      },
      {
        align: 'left',
        text: 'Description',
        value: 'description'
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
      findDatastreams: 'datastreams/find',
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
        const result = this.indexer.query(value)

        this.facetCounts = result.counts()
        this.facetKeys = result.keys()
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
    }
  },

  created() {
    this.datastreams = []
    // this.indexer = null

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

    this.fetch()
  },

  methods: {
    ...mapActions({
      fetchDatastreams: 'datastreams/find',
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

    workerMessageHandler(event) {
      if (event.data.datastreams) {
        this.datastreams = event.data.datastreams
        this.indexer = new FacetIndexer(event.data.indexer)

        this.apply()
      }
    }
  }
}
</script>

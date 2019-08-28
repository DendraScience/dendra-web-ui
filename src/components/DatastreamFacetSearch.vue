<template>
  <v-container fluid grid-list-xl>
    <v-layout wrap>
      <v-flex xs12 md4>
        <v-list dense>
          <v-subheader>Stations</v-subheader>
          <v-list-item-group
            v-model="selectedStations"
            color="primary"
            multiple
          >
            <v-list-item
              v-for="(item, index) in findStations({ query: stationsQuery })
                .data"
              :key="index"
              :disabled="
                !(
                  indexerResult &&
                  indexerResult.counts.Station &&
                  indexerResult.counts.Station[item._id] > 0
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
                    <span class="primary--text"
                      >({{
                        indexerResult | get(`counts.Station.${item._id}`, 0)
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
        v-for="vocabulary in findVocabularies({ query: vocabulariesQuery })
          .data"
        :key="vocabulary._id"
        xs12
        md4
      >
        <v-list dense>
          <v-subheader>{{ vocabulary.label }}</v-subheader>
          <v-list-item-group
            v-model="selectedTerms[vocabulary._id]"
            color="primary"
            multiple
          >
            <v-list-item
              v-for="item in vocabulary.terms"
              :key="item.label"
              :disabled="
                !(
                  indexerResult &&
                  indexerResult.counts[vocabulary.label] &&
                  indexerResult.counts[vocabulary.label][item.label] > 0
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
                    <span class="primary--text"
                      >({{
                        indexerResult
                          | get(`counts.${vocabulary.label}.${item.label}`, 0)
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

    <v-layout wrap>
      <v-flex xs12>
        <v-text-field
          v-model.trim="search"
          append-icon="search"
          filled
          flat
          label="Filter datastreams"
        ></v-text-field>
      </v-flex>

      <v-flex xs12>
        <v-data-table
          :footer-props="{ itemsPerPageOptions: [10, 50, 100, 500] }"
          :headers="headers"
          :hide-default-header="$vuetify.breakpoint.xsOnly"
          :items="datastreamsFound"
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

          <!--
          <template
            v-if="$scopedSlots.select"
            v-slot:item.select="{ item }"
            class="text-no-wrap px-0"
          >
            <slot name="select" :item="item" />
          </template>
          <template v-slot:item.station.name="{ item }">
            <nuxt-link
              v-if="showLink && item.station._id"
              :to="{
                name: 'orgs-orgSlug-stations-stationId',
                params: {
                  orgSlug: org.slug,
                  stationId: item.station_id
                }
              }"
              >{{ item.station.name }}</nuxt-link
            ><span v-else>{{ item.station.name }}</span>
          </template>
          -->

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
</template>

<script>
// import _debounce from 'lodash/debounce'
import _set from 'lodash/set'
import { mapActions, mapGetters, mapState } from 'vuex'
import { FacetIndexer } from '@/lib/facet-indexer'
import IndicatorCell from '@/components/IndicatorCell'

export default {
  $_veeValidate: {
    validator: 'new'
  },

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

    indexerResult: null,
    indexerQuery: {},

    datastreams: null,

    search: null,
    // searchDebounce: null,

    selectedStations: [],
    selectedTerms: {},

    datastreamFacetWorker: null,

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
      findStations: 'stations/find',
      findVocabularies: 'vocabularies/find',
      getStation: 'stations/get',
      getVocabulary: 'vocabularies/get'
    }),
    ...mapState(['auth']),

    datastreamsFound() {
      return this.indexerResult
        ? this.indexerResult.keys.map(key => this.datastreams[key])
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
        scheme_id: this.schemeId,
        vocabulary_type: 'class',
        $sort: { name: 1 }
      }
    }
  },

  watch: {
    indexerQuery: {
      handler(value) {
        this.indexerResult = this.indexer.apply(value)
      },
      deep: true
    },

    // searchDebounce(newValue) {
    //   this.debouncedSearch(newValue)
    // },

    selectedStations() {
      this.buildIndexerQuery()
    },

    selectedTerms: {
      handler() {
        this.buildIndexerQuery()
      },
      deep: true
    }
  },

  created() {
    this.datastreams = []
    this.indexer = null

    // this.debouncedSearch = _debounce(value => {
    //   this.search = value
    // }, 400)

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
    this.indexer = null

    // this.debouncedSearch.cancel()
    // this.debouncedSearch = null

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
      this.indexerResult = this.indexer.apply(this.indexerQuery)
    },

    buildIndexerQuery() {
      const { selectedStations, selectedTerms } = this
      const query = {}

      // HACK: THIS IS HORRIBLE!!!
      const stations = this.findStations({ query: this.stationsQuery })
      selectedStations.forEach(index => {
        _set(query, `Station.${stations.data[index]._id}`, true)
      })

      Object.keys(selectedTerms).forEach(key => {
        const vocabulary = this.getVocabulary(key)

        selectedTerms[key].forEach(index => {
          _set(
            query,
            `${vocabulary.label}.${vocabulary.terms[index].label}`,
            true
          )
        })
      })

      this.indexerQuery = query
    },

    fetch() {
      this.fetchStations({ paginate: false, query: this.stationsQuery })
      this.fetchVocabularies({ paginate: false, query: this.vocabulariesQuery })

      const fetchSpec = {
        isEnabled: true,
        orgId: this.org._id,
        schemeId: this.schemeId
      }
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

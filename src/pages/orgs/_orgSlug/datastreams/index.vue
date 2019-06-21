<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout column>
          <v-flex>
            <v-tabs v-model="tabIndex" class="elevation-2" fixed-tabs>
              <v-tab>
                Search
              </v-tab>
              <v-tab>
                Chart
              </v-tab>
              <v-tab disabled>
                Download
              </v-tab>

              <v-tab-item>
                <v-card flat>
                  <v-card-title primary-title class="headline">
                    Datastreams
                  </v-card-title>

                  <v-container fluid>
                    <feathers-vuex-find
                      v-slot="{ isFindPending: loading, items: stations }"
                      :query="{
                        is_hidden: false,
                        organization_id: org._id,
                        station_type: 'weather',
                        $sort: { name: 1 }
                      }"
                      service="stations"
                    >
                      <v-layout row wrap>
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
                      v-slot="{ items: vocabularies }"
                      :query="{
                        is_hidden: false,
                        scheme_id: 'ds',
                        vocabulary_type: 'class',
                        $sort: { name: 1 }
                      }"
                      service="vocabularies"
                    >
                      <v-layout row wrap>
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
                      v-slot="{
                        isFindPending: loading,
                        items: datastreams,
                        pagination
                      }"
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
                      <v-layout row wrap>
                        <v-flex xs12>
                          <v-text-field
                            v-model.trim="datastreamsSearchDebounce"
                            append-icon="search"
                            clearable
                            label="Filter datastreams"
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
                                  flat
                                  icon
                                  small
                                  @click="
                                    incrementQuantity({
                                      id: props.item._id,
                                      max: 1
                                    })
                                  "
                                >
                                  <v-icon v-if="props.item.quantitySelected"
                                    >check_box</v-icon
                                  >
                                  <v-icon v-else
                                    >check_box_outline_blank</v-icon
                                  >
                                </v-btn>
                              </td>

                              <td>{{ props.item.station.name }}</td>
                              <td>{{ props.item.name }}</td>
                              <td>{{ props.item.description }}</td>
                            </template>
                          </v-data-table>
                        </v-flex>
                      </v-layout>
                    </feathers-vuex-find>
                  </v-container>

                  <v-card-actions>
                    <v-btn :disabled="!cartCount" @click="resetCart"
                      >Reset</v-btn
                    >
                    <v-btn :disabled="!cartCount" @click="goToChartTab"
                      >Chart</v-btn
                    >
                    <v-btn disabled>Download</v-btn>
                  </v-card-actions>
                </v-card>
              </v-tab-item>

              <v-tab-item>
                <v-card v-if="cartCount || !charts.length" flat>
                  <v-card-title primary-title class="headline">
                    Selected datastreams
                  </v-card-title>

                  <v-container fluid>
                    <feathers-vuex-find
                      v-slot="{ items: datastreams }"
                      :query="selectedDatastreamsQuery"
                      watch="query"
                      local
                      service="datastreams"
                    >
                      <v-layout row wrap>
                        <v-flex xs12>
                          <v-data-table
                            :headers="selectedDatastreamsHeaders"
                            :items="datastreams"
                            disable-initial-sort
                            item-key="_id"
                          >
                            <template v-slot:items="props">
                              <td class="text-xs-center">
                                <v-btn-toggle
                                  :value="props.item.quantitySelected"
                                  class="elevation-0"
                                  mandatory
                                  @change="
                                    setQuantity({
                                      id: props.item._id,
                                      value: $event
                                    })
                                  "
                                >
                                  <v-btn :value="1" flat small>Y1</v-btn>
                                  <v-btn :value="2" flat small>Y2</v-btn>
                                </v-btn-toggle>
                              </td>

                              <td>{{ props.item.name }}</td>
                              <td>{{ props.item.description }}</td>

                              <td class="text-xs-center">
                                <v-btn
                                  icon
                                  small
                                  @click="
                                    setQuantity({
                                      id: props.item._id,
                                      value: 0
                                    })
                                  "
                                >
                                  <v-icon color="grey lighten1"
                                    >remove_circle</v-icon
                                  >
                                </v-btn>
                              </td>
                            </template>
                          </v-data-table>
                        </v-flex>
                      </v-layout>
                    </feathers-vuex-find>
                  </v-container>
                </v-card>

                <v-card flat>
                  <v-dialog
                    ref="dateDialog"
                    v-model="dateDialog"
                    lazy
                    max-width="680"
                  >
                    <v-card>
                      <v-card-title class="headline">Date range</v-card-title>

                      <v-container grid-list-lg>
                        <v-layout align-center justify-center row wrap>
                          <v-flex shrink>
                            <v-date-picker
                              v-model="fromDate"
                              no-title
                            ></v-date-picker>
                          </v-flex>

                          <v-flex shrink>
                            <v-date-picker
                              v-model="toDate"
                              no-title
                            ></v-date-picker>
                          </v-flex>
                        </v-layout>
                      </v-container>

                      <v-card-actions>
                        <v-spacer />
                        <v-btn flat color="primary" @click="dateDialog = false"
                          >Close</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>

                  <v-container fluid>
                    <v-layout row wrap>
                      <v-flex xs12 sm6>
                        <v-text-field
                          v-model="fromDate"
                          v-validate="'required|date_format:yyyy-MM-dd'"
                          :error-messages="errors.collect('fromDate')"
                          append-icon="event"
                          box
                          data-vv-name="fromDate"
                          label="From date"
                          required
                          @click:append="dateDialog = true"
                        ></v-text-field>
                      </v-flex>

                      <v-flex xs12 sm6>
                        <v-text-field
                          v-model="toDate"
                          v-validate="'required|date_format:yyyy-MM-dd'"
                          :error-messages="errors.collect('toDate')"
                          append-icon="event"
                          box
                          data-vv-name="toDate"
                          label="To date"
                          required
                          @click:append="dateDialog = true"
                        ></v-text-field>
                      </v-flex>

                      <v-flex v-if="cartCount || !charts.length" xs12>
                        <v-text-field
                          v-model="chartTitle"
                          v-validate="'max:100'"
                          :error-messages="errors.collect('chartTitle')"
                          box
                          clearable
                          data-vv-name="chartTitle"
                          label="Chart title"
                          required
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>

                  <v-card-actions>
                    <v-btn
                      :disabled="!cartCount"
                      block
                      color="primary"
                      large
                      @click="addChart"
                      >Chart
                      {{ cartCount }}
                      {{ cartCount | pluralize('Datastream') }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-tab-item>

              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    Coming soon!
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-flex v-if="charts.length" v-show="tabIndex === 1">
      <v-container fluid grid-list-xl>
        <v-layout column>
          <v-flex v-for="(chart, i) in charts" :key="chart.id"
            ><v-card>
              <v-card-text v-if="chart.alert">
                <v-alert
                  v-model="chart.alert.isShown"
                  :type="chart.alert.type"
                  outline
                >
                  {{ chart.alert.message }}
                </v-alert>
              </v-card-text>

              <div class="pt-1" style="position: relative;">
                <hc-time-series
                  v-if="seriesFetchWorker"
                  :id="chart.id"
                  :bus="chart.bus"
                  :export-chart-options="exportChartOptions"
                  :options="Object.freeze(chart.options)"
                  :series-options="Object.freeze(chart.seriesOptions)"
                  :fetch-spec="Object.freeze(chart.fetchSpec)"
                  :worker="Object.freeze(seriesFetchWorker)"
                />

                <v-menu bottom left offset-y>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      absolute
                      flat
                      icon
                      right
                      small
                      style="margin-top: 30px;"
                      top
                      v-on="on"
                    >
                      <v-icon>more_vert</v-icon>
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-tile @click="charts.splice(i, 1)">
                      <v-list-tile-title>Remove</v-list-tile-title>
                    </v-list-tile>

                    <v-list-tile
                      :disabled="!chart.isReady"
                      @click="showExportDialog(chart)"
                    >
                      <v-list-tile-title>Export as...</v-list-tile-title>
                    </v-list-tile>

                    <v-list-tile
                      v-if="previousExportIndex > -1"
                      :disabled="
                        !chart.isReady ||
                          (exportItems[previousExportIndex].download &&
                            !chart.canDownload)
                      "
                      @click="exportChart(chart, previousExportIndex)"
                    >
                      <v-list-tile-title
                        >Export as
                        {{
                          exportItems[previousExportIndex].title
                        }}</v-list-tile-title
                      >
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </div>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-dialog ref="exportDialog" v-model="exportDialog" lazy max-width="340">
      <v-card>
        <v-card-title class="headline">Export as</v-card-title>

        <v-container grid-list-lg>
          <v-layout align-center justify-center column>
            <v-flex>
              <v-radio-group v-model="selectedExportIndex" column>
                <v-radio
                  v-for="(item, j) in exportItems"
                  :key="j"
                  :disabled="
                    item.download && selectedChart && !selectedChart.canDownload
                  "
                  :label="item.title"
                  :value="j"
                />
              </v-radio-group>
            </v-flex>
          </v-layout>
        </v-container>

        <v-card-actions>
          <v-spacer />
          <v-btn
            flat
            color="primary"
            @click="exportChart(selectedChart, selectedExportIndex)"
            >Export</v-btn
          >
          <v-btn flat color="primary" @click="exportDialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
// TODO: Refactor and break out!!!
import HcTimeSeries from '@/components/HcTimeSeries'
import Vue from 'vue'

import moment from 'moment'
import timer from '@/mixins/timer'
import _debounce from 'lodash/debounce'
import _forEach from 'lodash/forEach'

import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    HcTimeSeries
  },

  middleware: ['check-org', 'dt-unit-vocabulary', 'system-time-utc'],

  mixins: [timer],

  data: () => ({
    charts: [],

    chartTitle: 'My Awesome Data',

    datastreamsHeaders: [
      {
        align: 'center',
        sortable: false,
        text: 'Select',
        value: '_id'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Station',
        value: 'station.name',
        width: '20%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Datastream',
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
      rowsPerPage: 10,
      sortBy: null,
      totalItems: null
    },
    datastreamsSearch: null,
    datastreamsSearchDebounce: null,

    tabIndex: 0,

    dateDialog: false,
    fromDate: moment()
      .startOf('d')
      .subtract(14, 'd')
      .format('YYYY-MM-DD'),
    toDate: moment()
      .endOf('d')
      .format('YYYY-MM-DD'),

    exportChartOptions: {
      plotOptions: {
        series: {
          dataLabels: {
            enabled: false
          }
        }
      }
    },
    exportDialog: false,
    exportItems: [
      {
        event: 'export',
        options: {
          sourceHeight: 450,
          sourceWidth: 800,
          type: 'image/jpeg'
        },
        title: 'JPEG image'
      },
      {
        event: 'export',
        options: {
          sourceHeight: 450,
          sourceWidth: 800
        },
        title: 'PNG image'
      },
      {
        event: 'export',
        options: {
          sourceHeight: 450,
          sourceWidth: 800,
          type: 'image/svg+xml'
        },
        title: 'SVG image'
      },
      {
        event: 'export',
        options: {
          sourceHeight: 450,
          sourceWidth: 800,
          type: 'application/pdf'
        },
        title: 'PDF document'
      },
      {
        download: true,
        event: 'download-csv',
        title: 'CSV file'
      }
    ],

    previousExportIndex: -1,
    selectedExportIndex: 0,

    selectedChart: null,

    queryDatastreamIds: [],

    selectedDatastreamsHeaders: [
      {
        align: 'center',
        sortable: false,
        text: 'Y-Axis',
        value: '_id'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Datastream',
        value: 'name',
        width: '40%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Description',
        value: 'description'
      },
      {
        align: 'center',
        sortable: false,
        value: '_id'
      }
    ],

    selectedStationIds: null,
    selectedTermLabels: {},

    seriesFetchWorker: null,

    timerInterval: 60000
  }),

  computed: {
    ...mapGetters(['getUnitAbbr', 'org']),
    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids'
    }),
    ...mapGetters({
      getDatastream: 'datastreams/get'
    }),

    ...mapState(['auth']),
    ...mapState('cart', ['quantitiesById']),

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
          'access_levels_resolved',
          'organization_id',
          'station_id'
        ],
        $sort: { name: 1 }
      }

      if (datastreamsSearch && datastreamsSearch.length)
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

    selectedDatastreamsQuery() {
      return {
        _id: { $in: this.cartIds },
        $sort: { name: 1 }
      }
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
      this.queryDatastreamIds = (newValue && newValue.ids) || []
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

    this.seriesFetchWorker = this.$workers.createSeriesFetchWorker()
    this.seriesFetchWorker.postMessage({
      accessToken: this.auth.accessToken,
      api: this.$api
    })
    // Handle HMR so we can debug
    // SEE: https://webpack.github.io/docs/hot-module-replacement.html
    if (module.hot) {
      this.seriesFetchWorker.removeEventListener(
        'message',
        this.workerMessageHandler
      )
    }
    this.seriesFetchWorker.addEventListener(
      'message',
      this.workerMessageHandler
    )

    this.uniqueCounter = (Math.random() * 0x80000000) | 0

    this.resetCart()
  },

  // mounted() {
  // },

  beforeDestroy() {
    this.debouncedDatastreamsSearch.cancel()
    this.debouncedDatastreamsSearch = null

    this.seriesFetchWorker.removeEventListener(
      'message',
      this.workerMessageHandler
    )
    this.seriesFetchWorker.terminate()
    this.seriesFetchWorker = null
  },

  methods: {
    ...mapActions(['getSystemTimeUTC']),

    ...mapMutations({
      incrementQuantity: 'cart/incrementQuantity',
      resetCart: 'cart/reset',
      setQuantity: 'cart/setQuantity'
    }),

    addChart() {
      const options = {
        chart: {
          height: 500,
          zoomType: 'x'
        },
        exporting: {
          chartOptions: {
            plotOptions: {
              series: {
                dataLabels: {
                  enabled: true
                }
              }
            }
          },
          fallbackToExportServer: false
        },
        navigation: {
          buttonOptions: {
            enabled: false
          }
        },
        title: {
          text: this.chartTitle
        },
        xAxis: {
          crosshair: true,
          title: {
            text: 'Time'
          },
          type: 'datetime'
        },
        yAxis: [
          {
            title: {
              text: null
            }
          },
          {
            opposite: true,
            title: {
              text: null
            }
          }
        ]
      }

      const seriesOptions = []

      const fetchSpec = {
        queries: [],
        startTime: moment.utc(this.fromDate).toISOString(),
        untilTime: moment
          .utc(this.toDate)
          .startOf('d')
          .add(1, 'd')
          .toISOString()
      }

      let canDownload = true

      _forEach(this.quantitiesById, (value, id) => {
        const datastream = this.getDatastream(id)

        if (this.$cannot('download', datastream)) canDownload = false

        seriesOptions.push({
          name: datastream.name,
          yAxis: value - 1
        })
        fetchSpec.queries.push({ datastream_id: id })
      })

      this.charts.unshift({
        alert: null,
        bus: new Vue(),
        canDownload,
        id: ++this.uniqueCounter,
        isReady: false,
        options,
        seriesOptions,
        fetchSpec
      })

      this.resetCart()
    },

    exportChart(chart, exportIndex) {
      const item = this.exportItems[exportIndex]

      this.exportDialog = false
      this.previousExportIndex = exportIndex

      chart.bus.$emit(item.event, item.options)
    },

    goToChartTab() {
      this.$vuetify.goTo(0, { duration: 0 }).then(() => {
        this.tabIndex = 1
      })
    },

    showExportDialog(chart) {
      this.selectedChart = chart
      this.selectedExportIndex = 0
      this.exportDialog = true
    },

    workerMessageHandler(event) {
      const { data } = event
      const chart = this.charts.find(c => c.id === data.id)

      if (!chart) return

      if (data.isFetching === false) {
        chart.isReady = true
      }

      if (data.message) {
        chart.alert = {
          isShown: true,
          message: data.message,
          type: 'info'
        }
      }

      if (data.error) {
        chart.alert = {
          isShown: true,
          message: data.error.message,
          type: 'error'
        }
      }
    },

    timerCallback() {
      return this.getSystemTimeUTC()
    }
  }
}
</script>

<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout column>
          <v-flex>
            <!-- TODO: Remove elevation? -->
            <v-tabs v-model="tabIndex" class="qq-elevation-2" fixed-tabs>
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

                  <datastream-search
                    :org="org"
                    :station-id="
                      this.$route.query && this.$route.query.stationId
                    "
                  >
                    <template v-slot:select="props">
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
                        <v-icon v-else>check_box_outline_blank</v-icon>
                      </v-btn>
                    </template>
                  </datastream-search>

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
                            :headers="selectedHeaders"
                            :items="datastreams"
                            disable-initial-sort
                            item-key="_id"
                          >
                            <template v-slot:items="props">
                              <td class="text-xs-center text-no-wrap px-0">
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

                              <td class="text-xs-center text-no-wrap px-0">
                                <v-icon
                                  color="grey lighten1"
                                  @click="
                                    setQuantity({
                                      id: props.item._id,
                                      value: 0
                                    })
                                  "
                                  >remove_circle</v-icon
                                >
                              </td>
                            </template>
                          </v-data-table>
                        </v-flex>
                      </v-layout>
                    </feathers-vuex-find>
                  </v-container>
                </v-card>

                <v-card flat>
                  <v-container fluid>
                    <v-layout row wrap>
                      <v-flex xs12>
                        <date-range-fields v-model="dateRange" />
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
import DatastreamSearch from '@/components/DatastreamSearch'
import DateRangeFields from '@/components/DateRangeFields'
import HcTimeSeries from '@/components/HcTimeSeries'
import Vue from 'vue'

import moment from 'moment'
import _forEach from 'lodash/forEach'

import { mapGetters, mapMutations, mapState } from 'vuex'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    DatastreamSearch,
    DateRangeFields,
    HcTimeSeries
  },

  middleware: ['check-org', 'dt-unit-vocabulary'],

  data: () => ({
    charts: [],

    chartTitle: 'My Awesome Data',

    tabIndex: 0,

    dateRange: {
      from: moment()
        .startOf('d')
        .subtract(14, 'd')
        .format('YYYY-MM-DD'),
      to: moment()
        .endOf('d')
        .format('YYYY-MM-DD')
    },

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

    selectedHeaders: [
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

    seriesFetchWorker: null
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

    selectedDatastreamsQuery() {
      return {
        _id: { $in: this.cartIds },
        $sort: { name: 1 }
      }
    }
  },

  created() {
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

  beforeDestroy() {
    this.seriesFetchWorker.removeEventListener(
      'message',
      this.workerMessageHandler
    )
    this.seriesFetchWorker.terminate()
    this.seriesFetchWorker = null
  },

  methods: {
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
                dataLabels: { enabled: true }
              }
            }
          },
          fallbackToExportServer: false
        },
        navigation: {
          buttonOptions: { enabled: false }
        },
        plotOptions: {
          series: {
            states: {
              inactive: { opacity: 0.9 }
            }
          }
        },
        title: {
          text: this.chartTitle
        },
        xAxis: {
          crosshair: true,
          title: { text: 'Time' },
          type: 'datetime'
        },
        yAxis: [
          {
            title: { text: null }
          },
          {
            opposite: true,
            title: { text: null }
          }
        ]
      }

      const seriesOptions = []

      const fetchSpec = {
        queries: [],
        startTime: moment.utc(this.dateRange.from).toISOString(),
        untilTime: moment
          .utc(this.dateRange.to)
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
    }
  }
}
</script>

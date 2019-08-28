<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout column>
          <v-flex>
            <!-- TODO: Remove elevation? -->
            <v-tabs v-model="tabIndex" fixed-tabs>
              <v-tab>
                View
              </v-tab>
              <v-tab>
                Chart
              </v-tab>
              <v-tab disabled>
                Download
              </v-tab>

              <v-tab-item>
                <v-card flat>
                  <v-card-title v-if="queryStationId" class="headline">
                    {{ getStation(queryStationId).name }} datastreams
                  </v-card-title>
                  <v-card-title v-else class="headline">
                    Datastreams
                  </v-card-title>

                  <datastream-facet-search
                    v-if="queryFaceted"
                    :is-enabled="queryIsEnabled"
                    :org="org"
                    :scheme-id="queryScheme"
                    :show-disabled="$can('create', 'datastreams')"
                    :station-id="queryStationId"
                    show-link
                  >
                    <template v-slot:select="{ item }">
                      <v-icon color="primary" @click="selectDatastream(item)">{{
                        getDatastream(item._id) &&
                        getDatastream(item._id).quantitySelected
                          ? 'check_box'
                          : 'check_box_outline_blank'
                      }}</v-icon>
                    </template>
                  </datastream-facet-search>

                  <datastream-search
                    v-else
                    :is-enabled="queryIsEnabled"
                    :org="org"
                    :scheme-id="queryScheme"
                    :show-disabled="$can('create', 'datastreams')"
                    :station-id="queryStationId"
                    show-link
                  >
                    <template v-slot:select="{ item }">
                      <v-icon
                        color="primary"
                        @click="
                          incrementQuantity({
                            id: item._id,
                            max: 1
                          })
                        "
                        >{{
                          item.quantitySelected
                            ? 'check_box'
                            : 'check_box_outline_blank'
                        }}</v-icon
                      >
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
                <v-card v-if="cartCount || !charts.length" flat text>
                  <v-card-title class="headline">
                    Selected datastreams
                  </v-card-title>

                  <chart-datastream-cart />
                </v-card>

                <v-card flat>
                  <v-container fluid>
                    <v-layout wrap>
                      <v-flex xs12>
                        <date-range-fields v-model="dateRange" />
                      </v-flex>

                      <v-flex v-if="cartCount || !charts.length" xs12>
                        <v-text-field
                          v-model="chartTitle"
                          v-validate="'max:100'"
                          :error-messages="errors.collect('chartTitle')"
                          clearable
                          data-vv-name="chartTitle"
                          filled
                          flat
                          label="Chart title"
                          required
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>

                  <v-card-actions>
                    <v-btn
                      :disabled="!cartCount || errors.any()"
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
          <v-flex v-for="(chart, i) in charts" :key="chart.id">
            <datastream-chart
              :value="chart"
              :worker="Object.freeze(seriesFetchWorker)"
            >
              <template v-slot:menu>
                <v-list>
                  <v-list-item @click="charts.splice(i, 1)">
                    <v-list-item-title>Remove</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    :disabled="!chart.isReady"
                    @click="showExportDialog(chart)"
                  >
                    <v-list-item-title>Export as...</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    v-if="previousExportIndex > -1"
                    :disabled="
                      !chart.isReady ||
                        (exportItems[previousExportIndex].download &&
                          !chart.canDownload)
                    "
                    @click="exportChart(chart, previousExportIndex)"
                  >
                    <v-list-item-title
                      >Export as
                      {{
                        exportItems[previousExportIndex].title
                      }}</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </template>
            </datastream-chart>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-dialog v-model="exportDialog" max-width="380">
      <v-card>
        <v-card-title class="headline grey lighten-4">Export as</v-card-title>

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

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="exportChart(selectedChart, selectedExportIndex)"
            >Export</v-btn
          >
          <v-btn text color="primary" @click="exportDialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
// TODO: Refactor and break out!!!
import Vue from 'vue'
import { mapGetters, mapMutations, mapState } from 'vuex'
import moment from 'moment'
import _forEach from 'lodash/forEach'
import { exportItems } from '@/lib/chart-export'
import ChartDatastreamCart from '@/components/ChartDatastreamCart'
import DatastreamChart from '@/components/DatastreamChart'
import DatastreamFacetSearch from '@/components/DatastreamFacetSearch'
import DatastreamSearch from '@/components/DatastreamSearch'
import DateRangeFields from '@/components/DateRangeFields'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    ChartDatastreamCart,
    DatastreamChart,
    DatastreamFacetSearch,
    DatastreamSearch,
    DateRangeFields
  },

  middleware: ['check-org', 'dt-unit-vocabulary', 'fetch-station'],

  data: () => ({
    charts: [],
    chartTitle: 'Enter Chart Title Here',

    tabIndex: 0,

    dateRange: {
      from: null,
      to: null
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
    exportItems,

    previousExportIndex: -1,
    selectedExportIndex: 0,

    selectedChart: null,

    seriesFetchWorker: null
  }),

  computed: {
    ...mapGetters(['getUnitAbbr', 'org']),
    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids'
    }),
    ...mapGetters({
      getDatastream: 'datastreams/get',
      getStation: 'stations/get'
    }),

    ...mapState(['auth']),
    ...mapState('cart', ['quantitiesById']),

    queryFaceted() {
      return this.$route.query.faceted
    },

    queryIsEnabled() {
      return this.$route.query.isEnabled
    },

    queryScheme() {
      return this.$route.query.scheme
    },

    queryStationId() {
      return this.$route.query.stationId
    }
  },

  created() {
    this.seriesFetchWorker = this.$workers.createSeriesFetchWorker()
    this.seriesFetchWorker.postMessage({
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

  mounted() {
    const { dateRange } = this

    dateRange.from = moment()
      .startOf('d')
      .subtract(14, 'd')
      .format(this.$dateFormats.y4md)
    dateRange.to = moment()
      .endOf('d')
      .format(this.$dateFormats.y4md)
  },

  methods: {
    ...mapMutations({
      addDatastream: 'datastreams/addItem',
      incrementQuantity: 'cart/incrementQuantity',
      resetCart: 'cart/reset'
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
        startTime: moment(
          this.dateRange.from,
          this.$dateFormats.y4md,
          true
        ).toISOString(),
        untilTime: moment(this.dateRange.to, this.$dateFormats.y4md, true)
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

      this.seriesFetchWorker.postMessage({
        accessToken: this.auth.accessToken
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

    selectDatastream(item) {
      /* eslint-disable-next-line no-console */
      console.log('item', item)

      this.addDatastream(item)

      this.incrementQuantity({
        id: item._id,
        max: 1
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

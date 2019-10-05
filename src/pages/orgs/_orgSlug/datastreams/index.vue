<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout column>
          <v-flex>
            <v-alert :value="$cannot('graph', org)" type="warning">
              Note that your current access level may prevent you from graphing
              or downloading data.
            </v-alert>

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

                    <template v-slot:actions="{ item }">
                      <v-icon color="tertiary" @click="open(item._id)"
                        >open_in_new</v-icon
                      >
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

                    <template v-slot:actions="{ item }">
                      <v-icon color="tertiary" @click="open(item._id)"
                        >open_in_new</v-icon
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
                  <ValidationObserver v-slot="{ valid }">
                    <v-container fluid>
                      <v-layout wrap>
                        <v-flex xs12>
                          <date-range-fields v-model="dateRange" />
                        </v-flex>

                        <v-flex v-if="cartCount || !charts.length" xs12>
                          <ValidationProvider
                            v-slot="{ errors }"
                            name="chart title"
                            rules="required|max:100"
                          >
                            <v-text-field
                              v-model="chartTitle"
                              :error-messages="errors"
                              clearable
                              filled
                              flat
                              label="Chart title"
                              required
                            ></v-text-field>
                          </ValidationProvider>
                        </v-flex>
                      </v-layout>
                    </v-container>

                    <v-card-actions>
                      <v-btn
                        :disabled="!(cartCount && valid)"
                        block
                        color="primary"
                        large
                        @click="addChart"
                        >Chart
                        {{ cartCount }}
                        {{ cartCount | pluralize('Datastream') }}
                      </v-btn>
                    </v-card-actions>
                  </ValidationObserver>
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

    <v-btn
      v-if="
        !queryFaceted &&
          $can('create', {
            organization_id: org._id,
            state: 'pending',
            [$abilityTypeKey]: 'datastreams'
          })
      "
      :to="{
        name: 'orgs-orgSlug-datastreams-create',
        params: {
          orgSlug: org.slug
        }
      }"
      color="secondary"
      dark
      exact
      fab
      fixed
      nuxt
      right
      style="top: 80px;"
      top
    >
      <v-icon>add</v-icon>
    </v-btn>

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

    <v-dialog v-model="leaveDialog" dark max-width="500px" persistent>
      <v-card>
        <v-card-title class="headline">
          Charts exist
        </v-card-title>

        <v-card-text>
          You have one or more charts. Do you really want to leave this page?
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="leaveDialogClick(false)"
            >Stay on Page</v-btn
          >
          <v-btn @click="leaveDialogClick(true)">Leave Page</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
// TODO: Refactor and break out!!!
import Highcharts from 'highcharts'
import Vue from 'vue'
import { mapGetters, mapMutations, mapState } from 'vuex'
import moment from 'moment'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { exportItems } from '@/lib/chart-export'
import { dateFormats } from '@/lib/date'
import ChartDatastreamCart from '@/components/ChartDatastreamCart'
import DatastreamChart from '@/components/DatastreamChart'
import DatastreamFacetSearch from '@/components/DatastreamFacetSearch'
import DatastreamSearch from '@/components/DatastreamSearch'
import DateRangeFields from '@/components/DateRangeFields'

export default {
  components: {
    ChartDatastreamCart,
    DatastreamChart,
    DatastreamFacetSearch,
    DatastreamSearch,
    DateRangeFields,
    ValidationObserver,
    ValidationProvider
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

    leaveDialog: false,

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
      getStation: 'stations/get',
      getVocabulary: 'vocabularies/get'
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

  watch: {
    queryFaceted() {
      this.tabIndex = 0
    },

    tabIndex(newValue) {
      const route = this.$route
      let path = route.path

      // Follow SPA best practices -- virtual pageviews
      // SEE: https://developers.google.com/analytics/devguides/collection/gtagjs/single-page-applications
      if (route.query.faceted) path = `${path}/faceted`
      if (newValue === 0) path = `${path}/view`
      else if (newValue === 1) path = `${path}/chart`

      this.$tracker.pageView({ name: route.name, path })
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

  beforeRouteLeave(to, from, next) {
    if (this.leaveNext) {
      this.leaveNext(false)
      this.leaveNext = next
    } else if (this.charts.length) {
      this.leaveDialog = true
      this.leaveNext = next
    } else {
      next()
    }
  },

  mounted() {
    const { dateRange } = this

    dateRange.from = moment()
      .startOf('d')
      .subtract(14, 'd')
      .format(dateFormats.y4md)
    dateRange.to = moment()
      .endOf('d')
      .format(dateFormats.y4md)
  },

  methods: {
    ...mapMutations({
      addDatastream: 'datastreams/addItem',
      incrementQuantity: 'cart/incrementQuantity',
      resetCart: 'cart/reset'
    }),

    addChart() {
      const colors = Highcharts.getOptions().colors
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
        tooltip: {
          shared: true
        },
        xAxis: {
          crosshair: true,
          title: { text: 'Time' },
          type: 'datetime'
        },
        yAxis: []
      }
      const seriesOptions = []
      const fetchSpec = {
        queries: [],
        startTime: moment(
          this.dateRange.from,
          dateFormats.y4md,
          true
        ).toISOString(),
        untilTime: moment(this.dateRange.to, dateFormats.y4md, true)
          .startOf('d')
          .add(1, 'd')
          .toISOString()
      }
      const unitVocabulary = this.getVocabulary('dt-unit')
      const { yAxis } = options
      let canDownload = true

      _forEach(this.quantitiesById, (value, id) => {
        const datastream = this.getDatastream(id)

        if (this.$cannot('download', datastream)) canDownload = false

        const unit = _get(datastream, 'terms.dt.Unit', '')
        const term =
          unitVocabulary && unitVocabulary.terms
            ? unitVocabulary.terms.find(term => term.label === unit)
            : null
        const unitText = term && term.abbreviation ? term.abbreviation : unit
        const stationName = datastream.station_lookup.name
        const yAxisLabelFormat = `{value} ${unitText}`
        const yAxisOpposite = value === 2 // Based on cart quantity

        let yAxisIndex = yAxis.findIndex(
          axis =>
            axis.labels.format === yAxisLabelFormat &&
            axis.opposite === yAxisOpposite
        )
        if (yAxisIndex === -1) {
          yAxisIndex = yAxis.length
          yAxis.push({
            labels: {
              format: yAxisLabelFormat,
              style: {
                color: colors[yAxisIndex]
              }
            },
            opposite: yAxisOpposite,
            title: {
              text: null
            }
          })
        }

        seriesOptions.push({
          name: `${stationName} ${datastream.name} ${unitText}`,
          yAxis: yAxisIndex
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

    leaveDialogClick(proceed) {
      this.leaveDialog = false
      this.leaveNext(proceed)
      this.leaveNext = null
    },

    open(datastreamId) {
      window.open(
        this.$router.resolve({
          name: 'orgs-orgSlug-datastreams-datastreamId',
          params: {
            orgSlug: this.org.slug,
            datastreamId
          }
        }).href,
        '_blank'
      )
    },

    selectDatastream(item) {
      // HACK: Ensure datastream is in store for cart lookup
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

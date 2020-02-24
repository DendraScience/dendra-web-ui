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

            <v-tabs
              v-model="tabIndex"
              background-color="grey lighten-2"
              fixed-tabs
            >
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
                        >mdi-open-in-new</v-icon
                      >
                    </template>
                  </datastream-facet-search>

                  <datastream-search
                    v-else
                    :is-enabled="queryIsEnabled"
                    :org="org"
                    :scheme-id="queryScheme"
                    :show-disabled="$can('create', 'datastreams')"
                    :show-hidden="$can('create', 'datastreams')"
                    :show-options="$can('create', 'datastreams')"
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
                        >mdi-open-in-new</v-icon
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
      <datastream-charts
        :value="charts"
        :worker="Object.freeze(seriesFetchWorker)"
        @remove="charts.splice($event, 1)"
      />
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
import _map from 'lodash/map'
import _sortBy from 'lodash/sortBy'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { defaultOptions } from '@/lib/chart'
import { dateFormats } from '@/lib/date'
import { idRandom } from '@/lib/utils'
import ChartDatastreamCart from '@/components/ChartDatastreamCart'
import DatastreamCharts from '@/components/DatastreamCharts'
import DatastreamFacetSearch from '@/components/DatastreamFacetSearch'
import DatastreamSearch from '@/components/DatastreamSearch'
import DateRangeFields from '@/components/DateRangeFields'

export default {
  components: {
    ChartDatastreamCart,
    DatastreamCharts,
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

    leaveDialog: false,

    seriesFetchWorker: null
  }),

  computed: {
    ...mapGetters(['getUnitText', 'org']),
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
      const { getUnitText } = this
      const colors = Highcharts.getOptions().colors
      const options = defaultOptions(this.chartTitle)
      const seriesOptions = []
      const fetchSpec = {
        queries: [],
        startTime: moment(
          this.dateRange.from,
          dateFormats.y4md,
          true
        ).valueOf(),
        untilTime: moment(this.dateRange.to, dateFormats.y4md, true)
          .startOf('d')
          .add(1, 'd')
          .valueOf()
      }
      const { yAxis } = options

      options.chart.resetPointer = true

      let canDownload = true
      let items = _map(this.quantitiesById, (value, id) => {
        const datastream = this.getDatastream(id)
        const unitText = getUnitText(datastream.dtUnit)

        return {
          datastream,
          seriesName: `${datastream.nameWithStation} ${unitText}`,
          yAxisLabelFormat: `{value} ${unitText}`,
          yAxisOpposite: value === 2 // Based on cart quantity
        }
      })

      items = _sortBy(items, ['datastream.nameWithStationAndUnit'])

      _forEach(
        items,
        ({ datastream, seriesName, yAxisLabelFormat, yAxisOpposite }) => {
          if (this.$cannot('download', datastream)) canDownload = false

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
            name: seriesName,
            yAxis: yAxisIndex
          })
          fetchSpec.queries.push({ datastream_id: datastream._id })
        }
      )

      this.seriesFetchWorker.postMessage({
        accessToken: this.auth.accessToken
      })
      this.charts.unshift({
        alert: null,
        bus: new Vue(),
        canDownload,
        fetchSpec,
        id: `datastreams-${new Date().getTime()}-${idRandom()}`,
        isReady: false,
        options,
        seriesOptions
      })
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

<template>
  <v-container v-if="org" fluid pa-0>
    <v-row no-gutters>
      <v-col>
        <v-container>
          <v-row dense>
            <v-col>
              <v-alert
                :value="$cannotGraph('organizations', org)"
                type="warning"
              >
                Note that your current access level may prevent you from
                graphing or downloading data.
              </v-alert>

              <v-tabs v-model="tabIndex" grow>
                <v-tab> View </v-tab>
                <v-tab> Chart </v-tab>
                <v-tab> Download </v-tab>

                <v-tab-item>
                  <v-card tile>
                    <query-header name="datastreams" :org="org">
                      Datastreams
                    </query-header>

                    <datastream-facet-search
                      v-if="queryFaceted"
                      :is-enabled="queryIsEnabled"
                      :org="org"
                      :scheme-id="queryScheme"
                      :show-disabled="showOutliers"
                      :station-id="queryStationId"
                      show-link
                      @current-items="currentItems = $event"
                      @datastreams="datastreams = $event"
                    >
                      <template v-slot:select="{ item }">
                        <v-icon color="primary" @click="selectItem(item)">{{
                          getQuantity(item._id)
                            ? mdiCheckboxMarked
                            : mdiCheckboxBlankOutline
                        }}</v-icon>
                      </template>

                      <template v-slot:actions="{ item }">
                        <v-icon color="tertiary" @click="open(item._id)">{{
                          mdiOpenInNew
                        }}</v-icon>
                      </template>
                    </datastream-facet-search>

                    <datastream-search
                      v-else
                      :annotation="annotation"
                      :is-enabled="queryIsEnabled"
                      :org="org"
                      :scheme-id="queryScheme"
                      :show-disabled="showOutliers"
                      :show-hidden="showOutliers"
                      :show-options="showOutliers"
                      :station-id="queryStationId"
                      :thing-type-id="queryThingTypeId"
                      show-link
                      @current-items="currentItems = $event"
                    >
                      <template v-slot:select="{ item }">
                        <v-icon color="primary" @click="selectItem(item)">{{
                          getQuantity(item._id)
                            ? mdiCheckboxMarked
                            : mdiCheckboxBlankOutline
                        }}</v-icon>
                      </template>

                      <template v-slot:actions="{ item }">
                        <v-icon color="tertiary" @click="open(item._id)">{{
                          mdiOpenInNew
                        }}</v-icon>
                      </template>
                    </datastream-search>

                    <v-card-actions>
                      <v-btn
                        :disabled="!selectableItems.length"
                        @click="selectAll"
                        >Select All</v-btn
                      >
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
                  <v-card v-if="cartCount || !charts.length" tile>
                    <content-header> Selected datastreams </content-header>

                    <chart-datastream-cart :datastreams="selectedDatastreams" />

                    <ValidationObserver v-slot="{ valid }">
                      <v-container fluid>
                        <v-row dense>
                          <v-col>
                            <date-range-fields
                              v-model="dateRange"
                              class="pa-0"
                            />
                          </v-col>
                        </v-row>

                        <v-row dense>
                          <v-col v-if="cartCount || !charts.length">
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
                          </v-col>
                        </v-row>
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
                  <v-card tile>
                    <content-header>
                      How To Download
                      <template v-slot:content>
                        <v-row>
                          <v-col class="body-1" cols="12" md="6">
                            <p>
                              Dendra’s primary download function is nearing
                              completion. Until it is ready, there is a simple
                              workaround to get your data.
                            </p>

                            <ol>
                              <li>
                                Go back to the previous tab,
                                <strong>Chart</strong>.
                              </li>
                              <li>
                                If you haven’t already, please set your target
                                time period and graph all the datastreams that
                                you would like to download.
                              </li>
                              <li>
                                Once the graph is complete, there will be a menu
                                in the top right corner of the plot represented
                                by three vertical dots (<v-icon>{{
                                  mdiDotsVertical
                                }}</v-icon
                                >).
                              </li>
                              <li>
                                Select from the menu,
                                <strong>Export as…</strong> (see image)
                              </li>
                              <li>
                                Choose <strong>CSV file</strong> (other options
                                will save the plot as an image).
                              </li>
                              <li>Click <strong>Export</strong>.</li>
                              <li>
                                Your data will be saved under the title of the
                                graph, e.g.
                                <code>data-i-want-to-download.csv</code>.
                              </li>
                            </ol>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-img
                              :src="
                                require('@/assets/download-data-from-graph.jpg')
                              "
                            />
                          </v-col>
                        </v-row>
                      </template>
                    </content-header>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>

    <v-row v-if="charts.length" v-show="tabIndex === 1">
      <v-col>
        <datastream-charts
          :value="charts"
          :worker="Object.freeze(seriesFetchWorker)"
          @remove="charts.splice($event, 1)"
        />
      </v-col>
    </v-row>

    <v-btn
      v-show="!queryFaceted && $canCreate('datastreams', org)"
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
      style="top: 80px"
      top
    >
      <v-icon>{{ mdiPlus }}</v-icon>
    </v-btn>

    <v-dialog v-model="leaveDialog" dark max-width="500" persistent>
      <v-card>
        <v-card-title class="headline"> Charts exist </v-card-title>

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

    <v-dialog v-model="selecting" dark hide-overlay persistent width="300">
      <v-card>
        <v-card-title class="title"> Selecting items... </v-card-title>

        <v-card-text>
          <v-progress-linear indeterminate color="white"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
// TODO: Refactor and break out!!!
import Highcharts from 'highcharts'
import Vue from 'vue'
import { mapGetters, mapMutations, mapState } from 'vuex'
import moment from 'moment'
import _forEach from 'lodash/forEach'
import _sortBy from 'lodash/sortBy'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { defaultOptions } from '@/lib/chart'
import { dateFormats } from '@/lib/date'
import { idRandom } from '@/lib/utils'
import routeQuery from '@/mixins/route-query'
import ChartDatastreamCart from '@/components/ChartDatastreamCart'
import ContentHeader from '@/components/ContentHeader'
import DatastreamCharts from '@/components/DatastreamCharts'
import DatastreamFacetSearch from '@/components/DatastreamFacetSearch'
import DatastreamSearch from '@/components/DatastreamSearch'
import DateRangeFields from '@/components/DateRangeFields'
import QueryHeader from '@/components/QueryHeader'

export default {
  components: {
    ChartDatastreamCart,
    ContentHeader,
    DatastreamCharts,
    DatastreamFacetSearch,
    DatastreamSearch,
    DateRangeFields,
    QueryHeader,
    ValidationObserver,
    ValidationProvider
  },

  middleware: [
    'check-org',
    'dt-unit-vocabulary',
    'fetch-thing-type',
    'fetch-station',
    'fetch-annotation'
  ],

  mixins: [routeQuery],

  data: () => ({
    charts: [],
    chartTitle: 'Enter Chart Title Here',

    currentItems: [],

    // HACK: For faceted search
    datastreams: [],

    tabIndex: 0,

    dateRange: {
      from: null,
      to: null
    },

    leaveDialog: false,

    selecting: false,
    progressCount: 0,

    seriesFetchWorker: null
  }),

  computed: {
    ...mapGetters(['getUnitText', 'org']),

    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids',
      getQuantity: 'cart/getQuantity'
    }),
    ...mapGetters({
      findDatastreams: 'datastreams/find',
      getAnnotation: 'annotations/get'
    }),

    ...mapState(['auth']),
    ...mapState('cart', ['quantitiesById']),

    annotation() {
      return this.queryAnnotationId
        ? this.getAnnotation(this.queryAnnotationId)
        : null
    },

    selectableItems() {
      const { currentItems, getQuantity } = this
      return currentItems.filter(item => !getQuantity(item._id))
    },

    selectedDatastreams() {
      const { cartIds, quantitiesById } = this

      return this.queryFaceted
        ? this.datastreams.filter(datastream => quantitiesById[datastream._id])
        : this.findDatastreams({ query: { _id: { $in: cartIds } } }).data
    },

    showOutliers() {
      return !!this.annotation || this.$canCreate('datastreams', this.org)
    }
  },

  watch: {
    queryFaceted() {
      this.tabIndex = 0
      this.resetCart()
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
    // HACK: For faceted search
    this.datastreams = null

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
    dateRange.to = moment().endOf('d').format(dateFormats.y4md)
  },

  methods: {
    ...mapMutations({
      addDatastream: 'datastreams/addItem',
      incrementQuantity: 'cart/incrementQuantity',
      resetCart: 'cart/reset',
      setQuantity: 'cart/setQuantity'
    }),

    addChart() {
      const { getUnitText, quantitiesById, selectedDatastreams } = this
      const colors = Highcharts.getOptions().colors
      const options = defaultOptions(this.chartTitle)
      const seriesOptions = []
      const fetchSpec = {
        queries: [],
        startTime: moment
          .utc(this.dateRange.from, dateFormats.y4md, true)
          .valueOf(),
        untilTime: moment
          .utc(this.dateRange.to, dateFormats.y4md, true)
          .startOf('d')
          .add(1, 'd')
          .valueOf()
      }
      const { yAxis } = options

      options.chart.resetPointer = true

      let canDownload = true
      let items = selectedDatastreams.map(datastream => {
        const dtUnit =
          datastream.terms && datastream.terms.dt && datastream.terms.dt.Unit
        const unitText = getUnitText(dtUnit) || ''

        return {
          datastream,
          seriesName: `${datastream.station_lookup.name} ${datastream.name} ${unitText}`,
          yAxisLabelFormat: `{value} ${unitText}`,
          yAxisOpposite: quantitiesById[datastream._id] === 2 // Based on cart quantity
        }
      })

      items = _sortBy(items, ['seriesName'])

      _forEach(
        items,
        ({ datastream, seriesName, yAxisLabelFormat, yAxisOpposite }) => {
          if (this.$cannotDownload('datastreams', datastream))
            canDownload = false

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

    selectAll() {
      this.selecting = true

      // HACK:
      setTimeout(() => {
        this.selectableItems.forEach(item =>
          this.setQuantity({ id: item._id, value: 1 })
        )
        this.selecting = false
      }, 500)
    },

    selectItem(item) {
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

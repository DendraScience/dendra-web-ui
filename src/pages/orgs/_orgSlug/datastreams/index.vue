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
                  <v-card outlined tile>
                    <query-header name="datastreams" :org="org">
                      Datastreams
                    </query-header>

                    <datastream-facet-search
                      v-if="queryFaceted"
                      :is-enabled="queryIsEnabled"
                      :org="org"
                      :scheme-id="queryScheme"
                      :select-station-id="this.$route.query.selectStationId"
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
                      <v-btn :disabled="!cartCount" @click="goToDownloadTab"
                        >Download</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-tab-item>

                <v-tab-item>
                  <v-card v-if="cartCount || !charts.length" outlined tile>
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

                        <v-row v-if="cartCount || !charts.length" dense>
                          <v-col>
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

                          <v-col cols="auto">
                            <v-checkbox
                              v-model="chartSync"
                              dense
                              label="Sync zooming"
                            ></v-checkbox>
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
                  <v-card v-if="auth.payload" outlined tile>
                    <content-header>
                      Download data
                      <template v-slot:content>
                        <v-row dense>
                          <v-col v-if="downloadSubmitDate">
                            <v-card color="grey lighten-4" outlined>
                              <v-card-title
                                >Your download has been submitted for
                                processing.
                              </v-card-title>
                              <v-card-subtitle
                                >You may check on the status of you download at
                                any time by opening the
                                <v-chip
                                  color="primary"
                                  label
                                  small
                                  @click="setDownloadDrawer(true)"
                                >
                                  <v-icon left small>{{ mdiDownload }}</v-icon>
                                  Dowloads</v-chip
                                >
                                drawer.
                              </v-card-subtitle>

                              <v-card-actions>
                                <v-btn
                                  text
                                  x-small
                                  @click="downloadSubmitDate = null"
                                  >Create Another Download</v-btn
                                >
                              </v-card-actions>
                            </v-card>
                          </v-col>
                          <v-col v-else>
                            <v-card outlined>
                              <v-card-subtitle>
                                <h4 class="subtitle-2">
                                  <v-icon class="mr-2" small>{{
                                    mdiChartTimelineVariant
                                  }}</v-icon
                                  >Datastreams: {{ cartCount }} selected
                                </h4>
                                <h4 class="subtitle-2">
                                  <v-icon class="mr-2" small>{{
                                    mdiFileDownload
                                  }}</v-icon
                                  >Format: CSV
                                </h4>
                              </v-card-subtitle>
                            </v-card>
                          </v-col>
                        </v-row>
                      </template>
                    </content-header>

                    <ValidationObserver v-slot="{ valid }">
                      <v-container v-if="!downloadSubmitDate" fluid>
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
                              name="download comment"
                              rules="required|max:100"
                            >
                              <v-text-field
                                v-model="downloadComment"
                                :error-messages="errors"
                                clearable
                                filled
                                flat
                                hint="Be detailed. This will help you find your download when it's ready."
                                label="Download comment"
                                required
                              ></v-text-field>
                            </ValidationProvider>
                          </v-col>
                        </v-row>
                      </v-container>

                      <v-card-actions>
                        <v-btn
                          v-if="!downloadSubmitDate"
                          :disabled="!(cartCount && valid)"
                          color="primary"
                          large
                          @click="createDownload"
                          >Create Download
                        </v-btn>

                        <v-spacer />

                        <v-btn large @click="setDownloadDrawer(true)"
                          >View Past Downloads
                          <v-icon class="ml-2">{{ mdiArrowRight }}</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </ValidationObserver>
                  </v-card>

                  <download-no-auth v-else />
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
          show-controls
          show-remove
          show-reset-zoom
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
        <v-card-title> Selecting items... </v-card-title>

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
import DownloadNoAuth from '@/components/DownloadNoAuth'
import QueryHeader from '@/components/QueryHeader'

export default {
  components: {
    ChartDatastreamCart,
    ContentHeader,
    DatastreamCharts,
    DatastreamFacetSearch,
    DatastreamSearch,
    DateRangeFields,
    DownloadNoAuth,
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
    chartSync: true,
    chartTitle: 'Enter Chart Title Here',

    currentItems: [],

    // HACK: For faceted search
    datastreams: [],

    downloadComment: 'Enter Download Comment Here',
    downloadSubmitDate: null,

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
      setDownloadDrawer: 'ux/setDownloadDrawer',
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
          yAxisLabelFormat: `{value:.3f} ${unitText}`,
          yAxisOpposite: quantitiesById[datastream._id] === 2 // Based on cart quantity
        }
      })

      items = _sortBy(items, ['seriesName'])

      _forEach(
        items,
        (
          { datastream, seriesName, yAxisLabelFormat, yAxisOpposite },
          seriesIndex
        ) => {
          if (this.$cannotDownload('datastreams', datastream))
            canDownload = false

          const color = colors[seriesIndex % colors.length]

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
                  color
                }
              },
              opposite: yAxisOpposite,
              title: {
                text: null
              }
            })
          }

          seriesOptions.push({
            color,
            name: seriesName,
            yAxis: yAxisIndex
          })
          fetchSpec.queries.push({
            config: datastream.general_config_resolved,
            datastream_id: datastream._id
          })
        }
      )

      this.seriesFetchWorker.postMessage({
        accessToken: this.auth.accessToken
      })
      const id = `datastreams-${new Date().getTime()}-${idRandom()}`
      this.charts.unshift({
        alert: null,
        bus: new Vue(),
        canDownload,
        fetchSpec,
        group: this.chartSync ? 1 : id,
        id,
        isReady: false,
        options,
        seriesOptions,
        sync: false
      })
    },

    async createDownload() {
      this.downloadSubmitDate = new Date()

      const data = {
        spec: {
          comment: this.downloadComment,
          method: 'csv',
          options: {
            begins_at: moment
              .utc(this.dateRange.from, dateFormats.y4md, true)
              .valueOf(),
            concurrency: 4,
            datastream_ids: this.cartIds,
            ends_before: moment
              .utc(this.dateRange.to, dateFormats.y4md, true)
              .startOf('d')
              .add(1, 'd')
              .valueOf()
          }
        },
        spec_type: 'file/export',
        storage: {
          method: 'minio'
        }
      }

      try {
        // HACK: Use fetch as the API cannot exchange the user token via websockets
        const response = await fetch(
          new URL(`${this.$api.uri}${this.$api.path}/downloads`),
          {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
              Authorization: this.auth.accessToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          }
        )
        if (!response.ok)
          throw new Error(`Non-success status code ${response.status}`)
      } catch (err) {
        this.$logger.error('createDownload', err)
      }

      this.setDownloadDrawer(true)
    },

    goToChartTab() {
      this.$vuetify.goTo(0, { duration: 0 }).then(() => {
        this.tabIndex = 1
      })
    },

    goToDownloadTab() {
      this.$vuetify.goTo(0, { duration: 0 }).then(() => {
        this.tabIndex = 2
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

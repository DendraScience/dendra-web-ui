<template>
  <v-container fluid>
    <v-row dense>
      <feathers-vuex-find
        v-if="!(datastreamId || stationId)"
        v-slot="{ isFindPending: loading, items: stations }"
        :query="
          showDisabled
            ? {
                is_hidden: false,
                organization_id: org._id,
                station_type: 'weather',
                $sort: { name: 1 }
              }
            : {
                is_enabled: true,
                is_hidden: false,
                organization_id: org._id,
                station_type: 'weather',
                $sort: { name: 1 }
              }
        "
        service="stations"
      >
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="selectedStationIds"
            :item-text="
              station =>
                station.is_enabled ? station.name : `${station.name} (disabled)`
            "
            :items="stations"
            :label="loading ? 'Loading...' : 'Station'"
            :loading="loading"
            chips
            deletable-chips
            dense
            filled
            flat
            hide-details
            hide-no-data
            item-value="_id"
            multiple
            small-chips
          ></v-autocomplete>
        </v-col>
      </feathers-vuex-find>

      <v-col cols="12" md="6">
        <v-select
          v-model="selectedState"
          :items="stateItems"
          chips
          deletable-chips
          dense
          label="State"
          filled
          flat
          hide-details
          small-chips
        ></v-select>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <date-range-fields v-model="dateRange" :required="false" class="pa-0" />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-text-field
          v-model.trim="searchDebounce"
          :append-icon="mdiMagnify"
          filled
          flat
          label="Filter annotations"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <feathers-vuex-find
          v-slot="{ isFindPending: loading, items: annotations, pagination }"
          :fetch-query="annotationsFetchQuery"
          :query="annotationsQuery"
          :watch="['fetchQuery.$and', 'fetchQuery.$limit', 'fetchQuery.$skip']"
          qid="search"
          service="annotations"
        >
          <v-data-table
            :footer-props="{ itemsPerPageOptions: [10, 50, 100] }"
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="annotations"
            :loading="loading"
            :options.sync="tableOptions"
            :server-items-length="pagination ? pagination.total : 0"
            disable-sort
            item-key="_id"
          >
            <template
              v-if="$scopedSlots.select"
              v-slot:item.select="{ item }"
              class="text-no-wrap px-0"
            >
              <slot name="select" :item="item" />
            </template>

            <template v-slot:item.title="{ item }">
              <nuxt-link
                v-if="showLink"
                :to="{
                  name: 'orgs-orgSlug-annotations-annotationId',
                  params: {
                    orgSlug: org.slug,
                    annotationId: item._id
                  }
                }"
                >{{ item.title }}</nuxt-link
              ><span v-else>{{ item.title }}</span>
            </template>

            <template v-slot:item.description="{ item }">
              {{ item.description | truncate({ length: 200 }) }}
            </template>

            <template v-slot:item.indicators="{ item }">
              <indicator-cell :value="item" hide-description />
            </template>

            <template v-slot:item.icons="{ item }">
              <span v-if="$scopedSlots.actions" class="text-no-wrap">
                <slot name="actions" :item="item" />
              </span>
            </template>
          </v-data-table>
        </feathers-vuex-find>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from 'moment'
import _debounce from 'lodash/debounce'
import DateRangeFields from '@/components/DateRangeFields'
import IndicatorCell from '@/components/IndicatorCell'
import { dateFormats } from '@/lib/date'
import { escapeRegExp } from '@/lib/utils'

export default {
  components: {
    DateRangeFields,
    IndicatorCell
  },

  props: {
    datastreamId: { default: null, type: String },
    isEnabled: { default: null, type: [Boolean, String] },
    org: { default: null, type: Object },
    showDisabled: { default: false, type: Boolean },
    showOptions: { default: false, type: Boolean },
    showLink: { default: false, type: Boolean },
    stationId: { default: null, type: String }
  },

  data: () => ({
    dateRange: {
      from: null,
      to: null
    },

    headers: [
      {
        align: 'center',
        value: 'select',
        width: '50px'
      },
      {
        align: 'left',
        text: 'State',
        value: 'state',
        width: '10%'
      },
      {
        align: 'left',
        text: 'Title',
        value: 'title',
        width: '40%'
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

    optionItems: ['Disabled'],

    queryAnnotationIds: [],

    search: null,
    searchDebounce: null,

    selectedOptions: null,
    selectedState: null,
    selectedStationIds: null,

    stateItems: ['pending', 'approved', 'rejected'],

    tableOptions: {
      descending: false,
      page: 1,
      itemsPerPage: 50,
      totalItems: null
    }
  }),

  computed: {
    annotationsFetchQuery() {
      const {
        search,
        selectedOptions,
        selectedState,
        selectedStationIds,
        tableOptions
      } = this
      const { page, itemsPerPage } = tableOptions

      const query = {
        organization_id: this.org._id,
        $limit: itemsPerPage,
        $skip: (page - 1) * itemsPerPage,
        $select: [
          '_id',
          'access_levels_resolved',
          'description',
          'intervals',
          'is_enabled',
          'organization_id',
          'state',
          'title'
        ],
        $sort: {
          'intervals.0.begins_at': 1,
          'intervals.0.ends_before': 1,
          _id: 1
        }
      }

      const ands = []

      if (this.isEnabled !== null) ands.push({ is_enabled: this.isEnabled })
      else if (!this.showDisabled) ands.push({ is_enabled: true })
      else if (selectedOptions && selectedOptions.includes('Disabled'))
        ands.push({ is_enabled: false })

      if (selectedState) ands.push({ state: selectedState })

      if (search && search.length) {
        // TODO: Implement n-grams for partial full-text search! https://en.wikipedia.org/wiki/N-gram
        ands.push({
          $or: [
            {
              title: {
                $regex: `^${escapeRegExp(search)}`,
                $options: 'i'
              }
            },
            {
              $text: { $search: `${search}` }
            }
          ]
        })
      }

      if (this.datastreamId) ands.push({ datastream_ids: this.datastreamId })

      if (this.stationId) {
        ands.push({ affected_station_ids: this.stationId })
      } else if (selectedStationIds && selectedStationIds.length) {
        ands.push({ affected_station_ids: { $in: selectedStationIds } })
      }

      const fromTime = moment(this.dateRange.from, dateFormats.y4md, true)
      if (fromTime.isValid())
        ands.push({
          'intervals.begins_at': { $gte: fromTime.toISOString() }
        })

      const toTime = moment(this.dateRange.to, dateFormats.y4md, true)
        .startOf('d')
        .add(1, 'd')
      if (toTime.isValid())
        ands.push({
          'intervals.ends_before': { $lt: toTime.toISOString() }
        })

      if (ands.length) query.$and = ands

      return query
    },

    paginationSearch() {
      return this.$store.state.annotations.pagination.search
    },

    annotationsQuery() {
      return {
        _id: { $in: this.queryAnnotationIds },
        $sort: {
          'intervals.0.begins_at': 1,
          'intervals.0.ends_before': 1,
          _id: 1
        }
      }
    }
  },

  watch: {
    paginationSearch(newValue) {
      this.queryAnnotationIds = (newValue && newValue.ids) || []
    },

    searchDebounce(newValue) {
      this.debouncedSearch(newValue)
    }
  },

  created() {
    this.debouncedSearch = _debounce(value => {
      this.search = value
    }, 400)
  },

  mounted() {
    let { headers } = this

    if (!this.$scopedSlots.select) headers = headers.slice(1)
    if (!this.$scopedSlots.actions) headers = headers.slice(0, -1)

    this.headers = headers
  },

  beforeDestroy() {
    this.debouncedSearch.cancel()
    this.debouncedSearch = null
  }
}
</script>

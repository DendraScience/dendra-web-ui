<template>
  <v-container fluid grid-list-lg>
    <v-layout wrap>
      <v-flex xs12>
        <date-range-fields v-model="dateRange" />
      </v-flex>
    </v-layout>

    <feathers-vuex-find
      v-slot="{
        isFindPending: loading,
        items: annotations,
        pagination
      }"
      :fetch-query="annotationsFetchQuery"
      :query="annotationsQuery"
      :watch="['fetchQuery.$and', 'fetchQuery.$limit', 'fetchQuery.$skip']"
      qid="search"
      service="annotations"
    >
      <v-layout wrap>
        <v-flex xs12>
          <v-text-field
            v-model.trim="searchDebounce"
            append-icon="search"
            clearable
            filled
            flat
            label="Filter annotations"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
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
    </feathers-vuex-find>
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
    isEnabled: { default: null, type: [Boolean, String] },
    org: { default: null, type: Object },
    showDisabled: { default: false, type: Boolean },
    showLink: { default: false, type: Boolean }
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

    queryAnnotationIds: [],

    search: null,
    searchDebounce: null,

    tableOptions: {
      descending: false,
      page: 1,
      itemsPerPage: 50,
      totalItems: null
    }
  }),

  computed: {
    annotationsFetchQuery() {
      const { search, tableOptions } = this
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

      if (this.isEnabled !== null) query.is_enabled = this.isEnabled
      else if (!this.showDisabled) query.is_enabled = true

      const ands = []

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

      const intervals = [
        {
          intervals: { $exists: false }
        }
      ]

      const fromTime = moment(this.dateRange.from, dateFormats.y4md, true)
      const toTime = moment(this.dateRange.to, dateFormats.y4md, true)
        .startOf('d')
        .add(1, 'd')

      if (fromTime.isValid()) {
        intervals.push({
          $and: [
            { 'intervals.begins_at': { $exists: false } },
            { 'intervals.ends_before': { $gt: fromTime.toISOString() } }
          ]
        })
      } else {
        ands.push({ _id: '' })
      }

      if (toTime.isValid()) {
        intervals.push({
          $and: [
            { 'intervals.begins_at': { $lt: toTime.toISOString() } },
            { 'intervals.ends_before': { $exists: false } }
          ]
        })
      } else {
        ands.push({ _id: '' })
      }

      if (fromTime.isBefore(toTime)) {
        intervals.push({
          $and: [
            { 'intervals.begins_at': { $lt: toTime.toISOString() } },
            { 'intervals.ends_before': { $gt: fromTime.toISOString() } }
          ]
        })
      } else {
        ands.push({ _id: '' })
      }

      ands.push({ $or: intervals })

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
    const { dateRange } = this
    let { headers } = this

    dateRange.from = moment()
      .startOf('y')
      .subtract(20, 'y')
      .format(dateFormats.y4md)
    dateRange.to = moment()
      .endOf('d')
      .format(dateFormats.y4md)

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

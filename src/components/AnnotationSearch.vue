<template>
  <v-container fluid>
    <v-layout row wrap>
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
      <v-layout row wrap>
        <v-flex xs12>
          <v-text-field
            v-model.trim="searchDebounce"
            append-icon="search"
            clearable
            label="Filter annotations"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="annotations"
            :loading="loading"
            :pagination.sync="tablePagination"
            :rows-per-page-items="[5, 10, 25, 50]"
            :total-items="pagination ? pagination.total : 0"
            disable-initial-sort
            item-key="_id"
          >
            <template v-slot:items="{ item }">
              <td
                v-if="$scopedSlots.select"
                class="text-xs-center text-no-wrap px-0"
              >
                <slot name="select" :item="item" />
              </td>

              <td>{{ item.state }}</td>
              <td>
                <nuxt-link
                  :to="{
                    name: 'orgs-orgSlug-annotations-annotationId',
                    params: {
                      orgSlug: org.slug,
                      annotationId: item._id
                    }
                  }"
                  >{{ item.title }}</nuxt-link
                >
              </td>
              <td>{{ item.description | truncate({ length: 200 }) }}</td>

              <td
                v-if="$scopedSlots.actions"
                class="text-xs-right text-no-wrap px-0"
              >
                <slot name="actions" :item="item" />
              </td>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </feathers-vuex-find>
  </v-container>
</template>

<script>
import DateRangeFields from '@/components/DateRangeFields'

import moment from 'moment'
import _debounce from 'lodash/debounce'

import { escapeRegExp } from '@/lib/utils'

export default {
  components: {
    DateRangeFields
  },

  props: {
    org: { default: null, type: Object }
  },

  data: () => ({
    dateRange: {
      from: moment()
        .startOf('d')
        .format('YYYY-MM-DD'),
      to: moment()
        .endOf('d')
        .format('YYYY-MM-DD')
    },

    headers: [
      {
        align: 'center',
        sortable: false,
        text: 'Select',
        value: '_id'
      },
      {
        align: 'left',
        sortable: false,
        text: 'State',
        value: 'state',
        width: '10%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Title',
        value: 'title',
        width: '40%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Description',
        value: 'description'
      },
      {
        sortable: false,
        value: '_id'
      }
    ],

    queryAnnotationIds: [],

    search: null,
    searchDebounce: null,

    tablePagination: {
      descending: false,
      page: 1,
      rowsPerPage: 10,
      sortBy: null,
      totalItems: null
    }
  }),

  computed: {
    annotationsFetchQuery() {
      const { search, tablePagination } = this
      const { page, rowsPerPage } = tablePagination

      const query = {
        is_enabled: true,
        organization_id: this.org._id,
        $limit: rowsPerPage,
        $skip: (page - 1) * rowsPerPage,
        $select: [
          '_id',
          'description',
          'access_levels_resolved',
          'intervals',
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

      const frTime = moment(this.dateRange.from)
      const toTime = moment(this.dateRange.to)
        .startOf('d')
        .add(1, 'd')

      if (frTime.isValid()) {
        intervals.push({
          $and: [
            { 'intervals.begins_at': { $exists: false } },
            { 'intervals.ends_before': { $gt: frTime.toISOString() } }
          ]
        })
      }

      if (toTime.isValid()) {
        intervals.push({
          $and: [
            { 'intervals.begins_at': { $lt: toTime.toISOString() } },
            { 'intervals.ends_before': { $exists: false } }
          ]
        })
      }

      if (frTime.isValid() && toTime.isValid()) {
        intervals.push({
          $and: [
            { 'intervals.begins_at': { $lt: toTime.toISOString() } },
            { 'intervals.ends_before': { $gt: frTime.toISOString() } }
          ]
        })
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

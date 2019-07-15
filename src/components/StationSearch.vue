<template>
  <v-container fluid grid-list-xl>
    <feathers-vuex-find
      v-slot="{
        isFindPending: loading,
        items: stations,
        pagination
      }"
      :fetch-query="stationsFetchQuery"
      :query="stationsQuery"
      :watch="['fetchQuery.$and', 'fetchQuery.$limit', 'fetchQuery.$skip']"
      qid="search"
      service="stations"
    >
      <v-layout row wrap>
        <v-flex xs12>
          <v-text-field
            v-model.trim="searchDebounce"
            append-icon="search"
            clearable
            label="Filter stations"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="stations"
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
              <td>{{ item.name }}</td>
              <td>{{ item.full_name }}</td>

              <td
                v-if="$scopedSlots.actions"
                class="text-xs-right text-no-wrap"
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
import _debounce from 'lodash/debounce'

import { escapeRegExp } from '@/lib/utils'

export default {
  props: {
    org: { default: null, type: Object }
  },

  data: () => ({
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
        text: 'Name',
        value: 'Name',
        width: '40%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Full name',
        value: 'full_name'
      },
      {
        sortable: false,
        value: '_id'
      }
    ],

    queryStationIds: [],

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
    stationsFetchQuery() {
      const { search, tablePagination } = this
      const { page, rowsPerPage } = tablePagination

      const query = {
        is_enabled: true,
        organization_id: this.org._id,
        $limit: rowsPerPage,
        $skip: (page - 1) * rowsPerPage,
        $select: [
          '_id',
          'is_hidden',
          'name',
          'full_name',
          'access_levels_resolved',
          'organization_id',
          'state'
        ],
        $sort: { name: 1, _id: 1 }
      }

      const ands = []

      if (search && search.length) {
        // TODO: Implement n-grams for partial full-text search! https://en.wikipedia.org/wiki/N-gram
        ands.push({
          $or: [
            {
              name: {
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

      if (ands.length) query.$and = ands

      return query
    },

    paginationSearch() {
      return this.$store.state.stations.pagination.search
    },

    stationsQuery() {
      return {
        _id: { $in: this.queryStationIds },
        $sort: { name: 1, _id: 1 }
      }
    }
  },

  watch: {
    paginationSearch(newValue) {
      this.queryStationIds = (newValue && newValue.ids) || []
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

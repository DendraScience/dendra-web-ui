<template>
  <v-container fluid>
    <feathers-vuex-find
      v-slot="{ isFindPending: loading, items: stations }"
      :query="{
        is_hidden: false,
        organization_id: org._id,
        station_type: 'weather',
        $sort: { name: 1 }
      }"
      service="stations"
    >
      <v-layout row wrap>
        <v-flex xs12>
          <v-autocomplete
            v-model="selectedStationIds"
            :items="stations"
            :label="loading ? 'Loading...' : 'Station'"
            :loading="loading"
            box
            chips
            clearable
            deletable-chips
            flat
            hide-details
            hide-no-data
            item-text="name"
            item-value="_id"
            multiple
          ></v-autocomplete>
        </v-flex>
      </v-layout>
    </feathers-vuex-find>

    <feathers-vuex-find
      v-slot="{ items: vocabularies }"
      :query="{
        is_hidden: false,
        scheme_id: 'ds',
        vocabulary_type: 'class',
        $sort: { name: 1 }
      }"
      service="vocabularies"
    >
      <v-layout row wrap>
        <v-flex
          v-for="vocabulary in vocabularies"
          :key="vocabulary._id"
          xs12
          md6
        >
          <v-autocomplete
            v-model="selectedTermLabels[vocabulary.label]"
            :items="vocabulary.terms"
            :label="vocabulary.label"
            :item-text="term => term.name || term.label"
            box
            chips
            clearable
            deletable-chips
            flat
            hide-details
            hide-no-data
            item-value="label"
            multiple
          ></v-autocomplete>
        </v-flex>
      </v-layout>
    </feathers-vuex-find>

    <feathers-vuex-find
      v-slot="{
        isFindPending: loading,
        items: datastreams,
        pagination
      }"
      :fetch-query="datastreamsFetchQuery"
      :query="datastreamsQuery"
      :watch="['fetchQuery.$and', 'fetchQuery.$limit', 'fetchQuery.$skip']"
      qid="search"
      service="datastreams"
    >
      <v-layout row wrap>
        <v-flex xs12>
          <v-text-field
            v-model.trim="searchDebounce"
            append-icon="search"
            clearable
            label="Filter datastreams"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="datastreams"
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

              <td>{{ item.station.name }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.description }}</td>

              <td
                v-if="$scopedSlots.actions"
                class="text-xs-center text-no-wrap px-0"
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
    org: { default: null, type: Object },
    stationId: { default: '', type: String }
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
        text: 'Station',
        value: 'station.name',
        width: '20%'
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
        text: 'Actions',
        value: '_id'
      }
    ],

    queryDatastreamIds: [],

    search: null,
    searchDebounce: null,

    selectedStationIds: null,
    selectedTermLabels: {},

    tablePagination: {
      descending: false,
      page: 1,
      rowsPerPage: 10,
      sortBy: null,
      totalItems: null
    }
  }),

  computed: {
    datastreamsFetchQuery() {
      const {
        search,
        selectedStationIds,
        selectedTermLabels,
        tablePagination
      } = this
      const { page, rowsPerPage } = tablePagination

      const query = {
        is_hidden: false,
        organization_id: this.org._id,
        $limit: rowsPerPage,
        $skip: (page - 1) * rowsPerPage,
        $select: [
          '_id',
          'is_hidden',
          'name',
          'description',
          'access_levels_resolved',
          'organization_id',
          'station_id'
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

      if (selectedStationIds && selectedStationIds.length) {
        ands.push({ station_id: { $in: selectedStationIds } })
      }

      Object.keys(selectedTermLabels).forEach(vLabel => {
        const tags = selectedTermLabels[vLabel].map(
          tLabel => `ds_${vLabel}_${tLabel}`
        )
        if (tags.length) ands.push({ 'terms_info.class_tags': { $in: tags } })
      })

      if (ands.length) query.$and = ands

      return query
    },

    paginationSearch() {
      return this.$store.state.datastreams.pagination.search
    },

    datastreamsQuery() {
      return {
        _id: { $in: this.queryDatastreamIds },
        $sort: { name: 1, _id: 1 }
      }
    }
  },

  watch: {
    paginationSearch(newValue) {
      this.queryDatastreamIds = (newValue && newValue.ids) || []
    },

    searchDebounce(newValue) {
      this.debouncedSearch(newValue)
    },

    selectedStationIds() {
      this.tablePagination.page = 1
    },

    selectedTermLabels: {
      handler() {
        this.tablePagination.page = 1
      },
      deep: true
    }
  },

  created() {
    if (this.stationId) this.selectedStationIds = [this.stationId]

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

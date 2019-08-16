<template>
  <v-container fluid grid-list-xl>
    <feathers-vuex-find
      v-slot="{ isFindPending: loading, items: stations }"
      :query="{
        is_enabled: true,
        is_hidden: false,
        organization_id: org._id,
        station_type: 'weather',
        $sort: { name: 1 }
      }"
      service="stations"
    >
      <v-layout wrap>
        <v-flex xs12>
          <v-autocomplete
            v-model="selectedStationIds"
            :items="stations"
            :label="loading ? 'Loading...' : 'Station'"
            :loading="loading"
            chips
            clearable
            deletable-chips
            filled
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
        is_enabled: true,
        is_hidden: false,
        scheme_id: 'ds',
        vocabulary_type: 'class',
        $sort: { name: 1 }
      }"
      service="vocabularies"
    >
      <v-layout wrap>
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
            chips
            clearable
            deletable-chips
            filled
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
      <v-layout wrap>
        <v-flex xs12>
          <v-text-field
            v-model.trim="searchDebounce"
            append-icon="search"
            clearable
            filled
            flat
            label="Filter datastreams"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-data-table
            :footer-props="{ itemsPerPageOptions: [5, 10, 25, 50] }"
            :headers="headers"
            :items="datastreams"
            :loading="loading"
            :mobile-breakpoint="0"
            :options.sync="tableOptions"
            :server-items-length="pagination ? pagination.total : 0"
            item-key="_id"
          >
            <template
              v-if="$scopedSlots.select"
              v-slot:item.select="{ item }"
              class="text-no-wrap px-0"
            >
              <slot name="select" :item="item" />
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
import _debounce from 'lodash/debounce'
import IndicatorCell from '@/components/IndicatorCell'
import { escapeRegExp } from '@/lib/utils'

export default {
  components: {
    IndicatorCell
  },

  props: {
    org: { default: null, type: Object },
    showDisabled: { default: false, type: Boolean },
    stationId: { default: '', type: String }
  },

  data: () => ({
    headers: [
      {
        align: 'center',
        sortable: false,
        value: 'select'
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
        width: '30%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Description',
        value: 'description'
      },
      {
        align: 'right',
        sortable: false,
        value: 'indicators'
      },
      {
        align: 'right',
        sortable: false,
        value: 'icons'
      }
    ],

    queryDatastreamIds: [],

    search: null,
    searchDebounce: null,

    selectedStationIds: null,
    selectedTermLabels: {},

    tableOptions: {
      descending: false,
      page: 1,
      itemsPerPage: 10,
      sortBy: [],
      totalItems: null
    }
  }),

  computed: {
    datastreamsFetchQuery() {
      const {
        search,
        selectedStationIds,
        selectedTermLabels,
        tableOptions
      } = this
      const { page, itemsPerPage } = tableOptions

      const query = {
        is_hidden: false,
        organization_id: this.org._id,
        $limit: itemsPerPage,
        $skip: (page - 1) * itemsPerPage,
        $select: [
          '_id',
          'access_levels_resolved',
          'description',
          'is_enabled',
          'is_hidden',
          'name',
          'organization_id',
          'station_id'
        ],
        $sort: { name: 1, _id: 1 }
      }

      if (!this.showDisabled) query.is_enabled = true

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
      this.tableOptions.page = 1
    },

    selectedTermLabels: {
      handler() {
        this.tableOptions.page = 1
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

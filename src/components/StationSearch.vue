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
      <v-layout wrap>
        <v-flex xs12>
          <v-text-field
            v-model.trim="searchDebounce"
            append-icon="search"
            clearable
            filled
            flat
            label="Filter stations"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-data-table
            :footer-props="{ itemsPerPageOptions: [10, 50, 100, 500] }"
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="stations"
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

            <template v-slot:item.name="{ item }">
              <nuxt-link
                v-if="showLink"
                :to="{
                  name: 'orgs-orgSlug-stations-stationId',
                  params: {
                    orgSlug: org.slug,
                    stationId: item._id
                  }
                }"
                >{{ item.name }}</nuxt-link
              ><span v-else>{{ item.name }}</span>
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
    showLink: { default: false, type: Boolean }
  },

  data: () => ({
    headers: [
      {
        align: 'center',
        value: 'select',
        width: '50px'
      },
      {
        align: 'left',
        text: 'Name',
        value: 'name',
        width: '30%'
      },
      {
        align: 'left',
        text: 'Description',
        value: 'description'
      },
      {
        align: 'right',
        value: 'indicators'
      },
      {
        align: 'right',
        value: 'icons'
      }
    ],

    queryStationIds: [],

    search: null,
    searchDebounce: null,

    tableOptions: {
      descending: false,
      page: 1,
      itemsPerPage: 100,
      totalItems: null
    }
  }),

  computed: {
    stationsFetchQuery() {
      const { search, tableOptions } = this
      const { page, itemsPerPage } = tableOptions

      const query = {
        is_hidden: false,
        organization_id: this.org._id,
        station_type: 'weather',
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
          'state'
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

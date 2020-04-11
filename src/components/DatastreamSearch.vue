<template>
  <v-container fluid grid-list-lg>
    <v-layout wrap>
      <feathers-vuex-find
        v-if="!stationId"
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
        <v-flex xs12 md6>
          <v-autocomplete
            v-model="selectedStationIds"
            :items="stations"
            :label="loading ? 'Loading...' : 'Station'"
            :loading="loading"
            chips
            deletable-chips
            filled
            flat
            hide-details
            hide-no-data
            item-text="nameWithEnabled"
            item-value="_id"
            multiple
          ></v-autocomplete>
        </v-flex>
      </feathers-vuex-find>

      <v-flex
        v-if="
          isEnabled === null &&
            isHidden === null &&
            showDisabled &&
            showHidden &&
            showOptions
        "
        xs12
        md6
      >
        <v-select
          v-model="selectedOptions"
          :items="optionItems"
          chips
          deletable-chips
          label="Options"
          filled
          flat
          hide-details
          multiple
        ></v-select>
      </v-flex>
    </v-layout>

    <feathers-vuex-find
      v-slot="{ items: vocabularies }"
      :query="{
        is_enabled: true,
        is_hidden: false,
        scheme_id: schemeId,
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
            filled
            flat
            label="Filter datastreams"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-data-table
            :footer-props="{ itemsPerPageOptions: [10, 50, 100] }"
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="datastreams"
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

            <template v-slot:item.station_lookup.name="{ item }">
              <nuxt-link
                v-if="showLink && item.station_id"
                :to="{
                  name: 'orgs-orgSlug-stations-stationId',
                  params: {
                    orgSlug: org.slug,
                    stationId: item.station_id
                  }
                }"
                >{{ item.station_lookup.name }}</nuxt-link
              ><span v-else-if="item.station_lookup">{{
                item.station_lookup.name
              }}</span>
            </template>

            <template v-slot:item.name="{ item }">
              <nuxt-link
                v-if="showLink"
                :to="{
                  name: 'orgs-orgSlug-datastreams-datastreamId',
                  params: {
                    orgSlug: org.slug,
                    datastreamId: item._id
                  }
                }"
                >{{ item.name }}</nuxt-link
              ><span v-else>{{ item.name }}</span>
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
    isEnabled: { default: null, type: [Boolean, String] },
    isHidden: { default: null, type: [Boolean, String] },
    org: { default: null, type: Object },
    schemeId: { default: 'ds', type: String },
    showDisabled: { default: false, type: Boolean },
    showHidden: { default: false, type: Boolean },
    showOptions: { default: false, type: Boolean },
    showLink: { default: false, type: Boolean },
    stationId: { default: null, type: String }
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
        text: 'Station',
        value: 'station_lookup.name',
        width: '20%'
      },
      {
        align: 'left',
        text: 'Datastream',
        value: 'name',
        width: '30%'
      },
      {
        align: 'left',
        text: 'Unit',
        value: 'terms.dt.Unit',
        width: '10%'
      },
      {
        align: 'left',
        text: 'Begins at',
        value: 'config_lookup.first.begins_at'
      },
      {
        align: 'left',
        text: 'Ends before',
        value: 'config_lookup.last.ends_before'
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

    optionItems: ['Disabled', 'Hidden'],

    queryDatastreamIds: [],

    search: null,
    searchDebounce: null,

    selectedOptions: null,
    selectedStationIds: null,
    selectedTermLabels: {},

    tableOptions: {
      descending: false,
      page: 1,
      itemsPerPage: 50,
      totalItems: null
    }
  }),

  computed: {
    datastreamsFetchQuery() {
      const {
        schemeId,
        search,
        selectedOptions,
        selectedStationIds,
        selectedTermLabels,
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
          'is_enabled',
          'is_hidden',
          'name',
          'organization_id',
          'station_id',
          'station_lookup',
          'config_lookup.first.begins_at',
          'config_lookup.last.ends_before',
          'terms'
        ],
        $sort: { name: 1, _id: 1 }
      }

      const ands = []

      if (this.isEnabled !== null) ands.push({ is_enabled: this.isEnabled })
      else if (!this.showDisabled) ands.push({ is_enabled: true })
      else if (selectedOptions && selectedOptions.includes('Disabled'))
        ands.push({ is_enabled: false })

      if (this.isHidden !== null) ands.push({ is_hidden: this.isHidden })
      else if (!this.showHidden) ands.push({ is_hidden: false })
      else if (selectedOptions && selectedOptions.includes('Hidden'))
        ands.push({ is_hidden: true })

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

      if (this.stationId) {
        ands.push({ station_id: this.stationId })
      } else if (selectedStationIds && selectedStationIds.length) {
        ands.push({ station_id: { $in: selectedStationIds } })
      }

      Object.keys(selectedTermLabels).forEach(vLabel => {
        const tags = selectedTermLabels[vLabel].map(
          tLabel => `${schemeId}_${vLabel}_${tLabel}`
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

    selectedOptions() {
      this.tableOptions.page = 1
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

<template>
  <v-container fluid>
    <v-row dense>
      <feathers-vuex-find
        v-if="!(annotation || stationId)"
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

      <v-col
        v-if="
          isEnabled === null &&
          isHidden === null &&
          showDisabled &&
          showHidden &&
          showOptions
        "
        cols="12"
        md="6"
      >
        <v-select
          v-model="selectedOptions"
          :items="optionItems"
          chips
          deletable-chips
          dense
          label="Options"
          filled
          flat
          hide-details
          multiple
          small-chips
        ></v-select>
      </v-col>
    </v-row>

    <feathers-vuex-find
      v-if="!annotation"
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
      <v-row dense>
        <v-col
          v-for="vocabulary in vocabularies"
          :key="vocabulary._id"
          cols="12"
          md="6"
        >
          <v-autocomplete
            v-model="selectedTermLabels[vocabulary.label]"
            :items="vocabulary.terms"
            :label="vocabulary.label"
            :item-text="term => term.name || term.label"
            chips
            deletable-chips
            dense
            filled
            flat
            hide-details
            hide-no-data
            item-value="label"
            multiple
            small-chips
          ></v-autocomplete>
        </v-col>
      </v-row>
    </feathers-vuex-find>

    <v-row>
      <v-col>
        <v-text-field
          v-model.trim="searchDebounce"
          :append-icon="mdiMagnify"
          filled
          flat
          label="Filter datastreams"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
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
            @current-items="$emit('current-items', $event)"
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

            <template
              v-slot:item.extent.begins_at="{
                item
              }"
            >
              {{
                item.extent &&
                item.extent.begins_at
                  | dateTimeFormatExtra(
                    undefined,
                    undefined,
                    item.station_lookup.utc_offset,
                    item.station_lookup.time_zone
                  )
              }}
            </template>

            <template
              v-slot:item.extent.ends_before="{
                item
              }"
            >
              {{
                item.extent &&
                item.extent.ends_before
                  | dateTimeFormatExtra(
                    undefined,
                    undefined,
                    item.station_lookup.utc_offset,
                    item.station_lookup.time_zone
                  )
              }}
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
        </feathers-vuex-find>
      </v-col>
    </v-row>
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
    annotation: { default: null, type: Object },
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
        value: 'name'
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
        value: 'extent.begins_at',
        width: '12%'
      },
      {
        align: 'left',
        text: 'Ends before',
        value: 'extent.ends_before',
        width: '12%'
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
          'extent',
          'is_enabled',
          'is_hidden',
          'name',
          'organization_id',
          'station_id',
          'station_lookup',
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

      if (this.annotation)
        ands.push({
          $or: [
            { _id: { $in: this.annotation.datastream_ids || [] } },
            { station_id: { $in: this.annotation.affected_station_ids || [] } }
          ]
        })

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

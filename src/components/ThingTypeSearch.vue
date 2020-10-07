<template>
  <v-container fluid>
    <v-row dense>
      <feathers-vuex-find
        v-if="!companyId"
        v-slot="{ isFindPending: loading, items: companies }"
        :query="{
          $sort: { name: 1 }
        }"
        service="companies"
      >
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="selectedCompanyIds"
            :item-text="company => company.full_name || company.name"
            :items="companies"
            :label="loading ? 'Loading...' : 'Company'"
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
        v-if="isEnabled === null && showDisabled && showOptions"
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

    <v-row dense>
      <v-col>
        <v-text-field
          v-model.trim="searchDebounce"
          :append-icon="mdiMagnify"
          filled
          flat
          label="Filter equipment"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <feathers-vuex-find
          v-slot="{
            isFindPending: loading,
            items: thingTypes,
            pagination
          }"
          :fetch-query="thingTypesFetchQuery"
          :query="thingTypesQuery"
          :watch="['fetchQuery.$and', 'fetchQuery.$limit', 'fetchQuery.$skip']"
          qid="search"
          service="thing-types"
        >
          <v-data-table
            :footer-props="{ itemsPerPageOptions: [10, 50, 100] }"
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="thingTypes"
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
                  name: 'equipment-thingTypeId',
                  params: {
                    thingTypeId: item._id
                  }
                }"
                >{{ item.name }}</nuxt-link
              ><span v-else>{{ item.name }}</span>
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
import _debounce from 'lodash/debounce'
import IndicatorCell from '@/components/IndicatorCell'
import { escapeRegExp } from '@/lib/utils'

export default {
  components: {
    IndicatorCell
  },

  props: {
    companyId: { default: null, type: String },
    isEnabled: { default: null, type: [Boolean, String] },
    showDisabled: { default: false, type: Boolean },
    showOptions: { default: false, type: Boolean },
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
        text: 'OEM',
        value: 'oem_company_lookup.name',
        width: '15%'
      },
      {
        align: 'left',
        text: 'Reseller',
        value: 'reseller_company_lookup.name',
        width: '15%'
      },
      {
        align: 'left',
        text: 'Name',
        value: 'name'
      },
      {
        align: 'left',
        text: 'Model',
        value: 'model',
        width: '10%'
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

    queryThingTypeIds: [],

    search: null,
    searchDebounce: null,

    selectedOptions: null,
    selectedCompanyIds: null,

    tableOptions: {
      descending: false,
      page: 1,
      itemsPerPage: 100,
      totalItems: null
    }
  }),

  computed: {
    thingTypesFetchQuery() {
      const { search, selectedOptions, selectedCompanyIds, tableOptions } = this
      const { page, itemsPerPage } = tableOptions

      const query = {
        $limit: itemsPerPage,
        $skip: (page - 1) * itemsPerPage,
        $select: [
          '_id',
          'external_links',
          'name',
          'model',
          'oem_company_id',
          'oem_company_lookup',
          'reseller_company_id',
          'reseller_company_lookup'
        ],
        $sort: { name: 1, _id: 1 }
      }

      const ands = []

      if (this.isEnabled !== null) ands.push({ is_enabled: this.isEnabled })
      else if (!this.showDisabled) ands.push({ is_enabled: true })
      else if (selectedOptions && selectedOptions.includes('Disabled'))
        ands.push({ is_enabled: false })

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

      if (this.companyId) {
        ands.push({
          $or: [
            { oem_company_id: this.companyId },
            { reseller_company_id: this.companyId }
          ]
        })
      } else if (selectedCompanyIds && selectedCompanyIds.length) {
        ands.push({
          $or: [
            { oem_company_id: { $in: selectedCompanyIds } },
            { reseller_company_id: { $in: selectedCompanyIds } }
          ]
        })
      }

      if (ands.length) query.$and = ands

      return query
    },

    paginationSearch() {
      return this.$store.state['thing-types'].pagination.search
    },

    thingTypesQuery() {
      return {
        _id: { $in: this.queryThingTypeIds },
        $sort: { name: 1, _id: 1 }
      }
    }
  },

  watch: {
    paginationSearch(newValue) {
      this.queryThingTypeIds = (newValue && newValue.ids) || []
    },

    searchDebounce(newValue) {
      this.debouncedSearch(newValue)
    },

    selectedOptions() {
      this.tableOptions.page = 1
    },

    selectedCompanyIds() {
      this.tableOptions.page = 1
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

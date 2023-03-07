<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <v-text-field
          v-model.trim="searchDebounce"
          :append-icon="mdiMagnify"
          filled
          flat
          label="Filter users"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <feathers-vuex-find
          v-slot="{ isFindPending: loading, items: users, pagination }"
          :fetch-query="usersFetchQuery"
          :query="usersQuery"
          :watch="['fetchQuery.$and', 'fetchQuery.$limit', 'fetchQuery.$skip']"
          qid="search"
          service="users"
        >
          <v-data-table
            :footer-props="{ itemsPerPageOptions: [10, 50, 100] }"
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="users"
            :loading="loading"
            :options.sync="tableOptions"
            :server-items-length="pagination ? pagination.total : 0"
            disable-sort
            item-key="_id"
          >
            <template #item.full_name="{ item }">
              <nuxt-link
                v-if="showLink && item.full_name"
                :to="{
                  name: 'users-userId',
                  params: {
                    userId: item._id
                  }
                }"
                >{{ item.full_name }}</nuxt-link
              ><span v-else>{{ item.full_name || '--' }}</span>
            </template>

            <template #item.icons="{ item }">
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
import { escapeRegExp } from '@/lib/utils'

export default {
  props: {
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
        text: 'Full name',
        value: 'full_name'
      },
      {
        align: 'left',
        text: 'Email',
        value: 'email'
      },
      {
        align: 'left',
        text: 'Roles',
        value: 'roles'
      },
      {
        align: 'right',
        value: 'icons',
        width: '5%'
      }
    ],

    queryUserIds: [],

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
    usersFetchQuery() {
      const { search, tableOptions } = this
      const { page, itemsPerPage } = tableOptions

      const query = {
        $limit: itemsPerPage,
        $skip: (page - 1) * itemsPerPage,
        $sort: { email: 1, _id: 1 },
        $select: ['_id', 'full_name', 'email', 'name', 'roles']
      }

      const ands = []

      if (search && search.length) {
        // TODO: Implement n-grams for partial full-text search! https://en.wikipedia.org/wiki/N-gram
        ands.push({
          $or: [
            {
              name: {
                $regex: `${escapeRegExp(search)}`,
                $options: 'i'
              }
            },
            {
              full_name: {
                $regex: `${escapeRegExp(search)}`,
                $options: 'i'
              }
            },
            {
              email: {
                $regex: `${escapeRegExp(search)}`,
                $options: 'i'
              }
            }
          ]
        })
      }

      if (ands.length) query.$and = ands

      return query
    },

    paginationSearch() {
      return this.$store.state.users.pagination.search
    },

    usersQuery() {
      return {
        _id: { $in: this.queryUserIds },
        $sort: { name: 1, _id: 1 }
      }
    }
  },

  watch: {
    paginationSearch(newValue) {
      this.queryUserIds = (newValue && newValue.ids) || []
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

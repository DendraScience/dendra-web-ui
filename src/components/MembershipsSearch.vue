<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <feathers-vuex-find
          v-slot="{ isFindPending: loading, items: memberships, pagination }"
          :fetch-query="membershipsFetchQuery"
          :query="membershipsQuery"
          :watch="['fetchQuery.$and', 'fetchQuery.$limit', 'fetchQuery.$skip']"
          qid="search"
          service="memberships"
        >
          <v-data-table
            :footer-props="{ itemsPerPageOptions: [10, 50, 100] }"
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="membershipsInnerJoin(memberships)"
            :loading="loading"
            :options.sync="tableOptions"
            :server-items-length="pagination ? pagination.total : 0"
            class="row-pointer"
            disable-sort
            item-key="_id"
          >
            <template #item.organization="{ item }">
              <nuxt-link
                v-if="showLink && item.organization"
                :to="{
                  name: 'organizations-orgId',
                  params: {
                    orgId: item.organization._id
                  }
                }"
                >{{
                  item.organization ? item.organization.full_name : '--'
                }}</nuxt-link
              ><span v-else>{{
                item.organization ? item.organization.full_name : '--'
              }}</span>
            </template>

            <template #item.person="{ item }">
              <span @click="handleRoute(item.person)"
                ><a>
                  {{ item.person ? item.person.name : '--' }}
                </a></span
              >
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
import { mapActions, mapGetters } from 'vuex'

export default {
  props: {
    showLink: { default: false, type: Boolean },
    selectedOrganization: { default: null, type: Object },
    selectedPerson: { default: null, type: Object },
    selectedRoles: { default: null, type: Array }
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
        text: 'Organization',
        value: 'organization'
      },
      {
        align: 'left',
        text: 'Person',
        value: 'person'
      },
      {
        align: 'left',
        text: 'Role',
        value: 'roles'
      },
      {
        align: 'right',
        value: 'icons',
        width: '5%'
      }
    ],

    membershipsIds: [],

    tableOptions: {
      descending: false,
      page: 1,
      itemsPerPage: 100,
      totalItems: null
    }
  }),

  computed: {
    ...mapGetters({
      organizations: 'organizations/list',
      persons: 'persons/list'
    }),

    membershipsFetchQuery() {
      const { tableOptions } = this
      const { page, itemsPerPage } = tableOptions

      const query = {
        $limit: itemsPerPage,
        $skip: (page - 1) * itemsPerPage,
        $sort: { _id: 1 }
      }
      const ands = []
      const { selectedOrganization, selectedPerson, selectedRoles } = this

      if (selectedOrganization) {
        ands.push({ organization_id: { $in: [selectedOrganization._id] } })
      }

      if (selectedPerson) {
        ands.push({ person_id: { $in: [selectedPerson._id] } })
      }

      if (selectedRoles && selectedRoles.length) {
        ands.push({ roles: { $in: selectedRoles } })
      }

      if (ands.length) query.$and = ands

      return query
    },

    paginationSearch() {
      return this.$store.state.memberships.pagination.search
    },

    membershipsQuery() {
      return {
        _id: { $in: this.membershipsIds },
        $sort: { _id: 1 }
      }
    }
  },

  watch: {
    paginationSearch(newValue) {
      this.membershipsIds = (newValue && newValue.ids) || []
    }
  },

  mounted() {
    let { headers } = this

    if (!this.$scopedSlots.select) headers = headers.slice(1)
    if (!this.$scopedSlots.actions) headers = headers.slice(0, -1)

    this.headers = headers
  },

  methods: {
    ...mapActions({
      fetchUsers: 'users/find'
    }),

    membershipsInnerJoin(member) {
      const { selectedOrganization, selectedPerson, selectedRoles } = this
      const membersArray = []
      let memberList = member

      if (selectedOrganization && !selectedPerson) {
        memberList = memberList.filter(mem =>
          selectedOrganization._id.includes(mem.organization_id)
        )
      }

      if (selectedPerson && !selectedOrganization) {
        memberList = memberList.filter(mem =>
          selectedPerson._id.includes(mem.person_id)
        )
      }

      if (selectedRoles && selectedRoles.length) {
        memberList = memberList.filter(mem =>
          selectedRoles.includes(mem.roles[0])
        )
      }

      for (let i = 0; i < memberList.length; i++) {
        const organization = this.organizations.find(
          org => org._id === memberList[i].organization_id
        )
        const person = this.persons.find(
          org => org._id === memberList[i].person_id
        )

        membersArray.push({
          ...memberList[i],
          organization,
          person
        })
      }

      return membersArray
    },

    async handleRoute(person) {
      const response = await this.fetchUsers({
        query: { person_id: person._id, $limit: 1 }
      })

      if (response.data && response.data.length) {
        this.$router.push({
          name: 'users-userId',
          params: { userId: response.data[0]._id }
        })
      }
    }
  }
}
</script>

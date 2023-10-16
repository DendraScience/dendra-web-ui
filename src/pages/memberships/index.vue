<template>
  <v-container>
    <v-row dense>
      <v-col>
        <v-tabs v-model="tabIndex" grow>
          <v-tab> View </v-tab>
          <v-tab> Manage </v-tab>

          <v-tab-item>
            <v-card outlined tile>
              <v-container fluid>
                <v-row dense>
                  <v-col>
                    <h2 class="headline">Current memberships</h2>
                  </v-col>
                </v-row>

                <membership-filters
                  :selected-organization.sync="selectedOrganization"
                  :selected-person.sync="selectedPerson"
                  :selected-roles="selectedRoles"
                  :roles-option="rolesOption"
                  @handle-organization="handleOrganization"
                  @handle-person="handlePerson"
                  @handle-roles="handleRoles"
                />
              </v-container>

              <membership-search
                show-link
                :selected-organization="selectedOrganization"
                :selected-person="selectedPerson"
                :selected-roles="
                  selectedRoles &&
                  selectedRoles.length &&
                  selectedRoles.filter(e => e !== 'none')
                "
              />
            </v-card>
          </v-tab-item>

          <v-tab-item>
            <v-card outlined tile>
              <v-container fluid>
                <v-row dense>
                  <v-col>
                    <h2 class="headline">Manage memberships</h2>
                  </v-col>
                </v-row>

                <membership-filters
                  :selected-organization.sync="selectedOrganization"
                  :selected-person.sync="selectedPerson"
                  :selected-roles="selectedRoles"
                  :roles-option="rolesOption"
                  @handle-organization="handleOrganization"
                  @handle-person="handlePerson"
                  @handle-roles="handleRoles"
                />
              </v-container>

              <membership-manage
                :key="tabIndex"
                :selected-organization="selectedOrganization"
                :selected-person="selectedPerson"
                :selected-roles="selectedRoles"
                :roles-option="rolesOption"
              />
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import routeQuery from '@/mixins/route-query'
import MembershipFilters from '@/components/MembershipFilters'
import MembershipSearch from '@/components/MembershipSearch'
import MembershipManage from '@/components/MembershipManage'

export default {
  components: {
    MembershipFilters,
    MembershipSearch,
    MembershipManage
  },

  mixins: [routeQuery],

  middleware: [
    'no-org',
    'no-auth-redirect-home',
    'fetch-organizations',
    'fetch-persons'
  ],

  data: () => ({
    tabIndex: 0,
    selectedOrganization: null,
    selectedPerson: null,
    selectedRoles: null
  }),

  computed: {
    ...mapGetters({
      getOrganization: 'organizations/get',
      getPerson: 'persons/get',
      organizations: 'organizations/list',
      persons: 'persons/list'
    }),

    rolesOption() {
      const roles = ['admin', 'curator', 'member']
      if (this.tabIndex !== 0) {
        roles.push('none')
      }
      return roles
    }
  },

  mounted() {
    const { queryOrganizationId, queryPersonId } = this

    if (queryOrganizationId) {
      const organization = this.getOrganization(queryOrganizationId)
      if (organization) this.selectedOrganization = organization
    } else if (queryPersonId) {
      const person = this.getPerson(queryPersonId)
      if (person) this.selectedPerson = person
    }
  },

  methods: {
    handlePerson(person) {
      this.selectedOrganization = null
      this.selectedPerson = person
    },

    handleOrganization(org) {
      this.selectedPerson = null
      this.selectedOrganization = org
    },

    handleRoles(roles) {
      this.selectedRoles = roles && roles.length ? roles : null
    }
  }
}
</script>

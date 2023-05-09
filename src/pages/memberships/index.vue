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
                    <h2 class="headline">Memberships</h2>
                  </v-col>
                </v-row>

                <memberships-filter
                  :selected-organization.sync="selectedOrganization"
                  :selected-person.sync="selectedPerson"
                  :selected-roles="selectedRoles"
                  :roles-option="rolesOption"
                  @handleorganization="handleorganization"
                  @handleperson="handleperson"
                  @handleRoles="handleRoles"
                />
              </v-container>

              <memberships-search
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

                <memberships-filter
                  :selected-organization.sync="selectedOrganization"
                  :selected-person.sync="selectedPerson"
                  :selected-roles="selectedRoles"
                  :roles-option="rolesOption"
                  @handleorganization="handleorganization"
                  @handleperson="handleperson"
                  @handleRoles="handleRoles"
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
import MembershipsFilter from '@/components/MembershipsFilter'
import MembershipsSearch from '@/components/MembershipsSearch'
import MembershipManage from '@/components/MembershipManage'

export default {
  components: {
    MembershipsFilter,
    MembershipsSearch,
    MembershipManage
  },

  middleware: ['no-auth-redirect-home', 'fetch-organizations', 'fetch-persons'],

  data: () => ({
    tabIndex: 0,
    selectedOrganization: null,
    selectedPerson: null,
    selectedRoles: null
  }),

  computed: {
    ...mapGetters({
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

  methods: {
    handleperson(person) {
      this.selectedOrganization = null
      this.selectedPerson = person
    },

    handleorganization(org) {
      this.selectedPerson = null
      this.selectedOrganization = org
    },

    handleRoles(roles) {
      this.selectedRoles = roles && roles.length ? roles : null
    }
  }
}
</script>

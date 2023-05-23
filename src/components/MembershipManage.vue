<template>
  <v-container v-if="selectedOrganization || selectedPerson" fluid class="pt-0">
    <v-row dense>
      <v-col>
        <v-text-field
          v-model.trim="searchDebounce"
          :append-icon="mdiMagnify"
          :label="
            selectedOrganization ? 'Filter persons' : 'Filter organization'
          "
          filled
          flat
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="items"
          :disable-pagination="true"
          :footer-props="{
            disablePagination: true,
            disableItemsPerPage: true
          }"
          :disable-sort="true"
          :hide-default-footer="true"
          :hide-default-header="$vuetify.breakpoint.xsOnly"
          item-key="_id"
          :search="search"
        >
          <template #item.name="{ item }">
            <span>{{ item ? item.name : '--' }}</span>
          </template>

          <template #item.full_name="{ item }">
            <span>{{ item ? item.full_name : '--' }}</span>
          </template>

          <template #item.role="{ item }">
            <v-menu offset-x transition="slide-x-transition">
              <template #activator="{ on }">
                <v-btn
                  :color="item.role ? 'secondary' : 'primary'"
                  small
                  width="90"
                  v-on="on"
                >
                  <span v-if="item.role" class="d-flex align-center">
                    <span>{{ item.role }}</span>
                    <v-icon small>{{ mdiMenuDown }}</v-icon></span
                  >
                  <v-icon v-else small>{{ mdiPlus }}</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(role, index) in item.role
                    ? rolesOption
                    : rolesOption.filter(r => r !== 'none')"
                  :key="index"
                  @click="
                    role === 'none'
                      ? handleRemove(item)
                      : handleRole({
                          membershipId: item.membership_id,
                          organizationId: item.organization_id,
                          personId: item.person_id,
                          selectedRole: role
                        })
                  "
                >
                  <v-list-item-title>{{ role }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
  <v-card v-else>
    <v-container fluid>
      <v-row dense>
        <v-col>
          <v-alert type="info"
            >Please select organization or person to manage memberships</v-alert
          >
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import _debounce from 'lodash/debounce'
export default {
  props: {
    selectedOrganization: { default: null, type: Object },
    selectedPerson: { default: null, type: Object },
    selectedRoles: { default: null, type: Array },
    rolesOption: { default: null, type: Array }
  },

  data: () => ({
    items: [],
    search: null,
    searchDebounce: null
  }),

  computed: {
    ...mapGetters({
      personsList: 'persons/list',
      organizationList: 'organizations/list'
    }),

    headers() {
      const header = [
        {
          align: 'center',
          value: 'select',
          width: '50px'
        },
        {
          align: 'left',
          text: 'Role',
          value: 'role'
        }
      ]

      this.selectedOrganization
        ? header.splice(
            1,
            0,
            {
              align: 'left',
              text: 'Person',
              value: 'name'
            },
            {
              align: 'left',
              text: 'Email',
              value: 'email'
            }
          )
        : header.splice(1, 0, {
            align: 'left',
            text: 'Organization',
            value: 'full_name'
          })

      return header
    }
  },

  watch: {
    selectedOrganization: {
      handler() {
        if (this.selectedOrganization) {
          this.membershipsOrgOuterJoin()
        }
      },
      immediate: true,
      deep: true
    },

    selectedPerson: {
      handler() {
        if (this.selectedPerson) {
          this.membershipsPersonOuterJoin()
        }
      },
      immediate: true,
      deep: true
    },

    selectedRoles: {
      handler() {
        if (this.selectedOrganization) {
          this.membershipsOrgOuterJoin()
        } else {
          this.membershipsPersonOuterJoin()
        }
      }
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

  beforeDestroy() {
    this.debouncedSearch.cancel()
    this.debouncedSearch = null
  },

  methods: {
    ...mapActions({
      create: 'memberships/create',
      patch: 'memberships/patch',
      fetchMemberships: 'memberships/find',
      removeMemberships: 'memberships/remove'
    }),

    async membershipsOrgOuterJoin() {
      const { personsList, selectedOrganization, selectedRoles } = this
      const membersArray = []

      const membersList = await this.fetchMemberships({
        query: { organization_id: selectedOrganization._id }
      })

      for (let i = 0; i < personsList.length; i++) {
        const person =
          membersList &&
          membersList.data &&
          membersList.data.find(mem => mem.person_id === personsList[i]._id)

        const data = {
          role: person && person.roles && person.roles[0],
          membership_id: person && person._id,
          organization_id: selectedOrganization._id,
          person_id: personsList[i]._id,
          ...personsList[i]
        }

        if (selectedRoles && selectedRoles.length) {
          if (
            person &&
            person.roles &&
            selectedRoles.includes(person.roles[0])
          ) {
            membersArray.push(data)
          }

          if (!person && selectedRoles.includes('none')) {
            membersArray.push(data)
          }
        } else {
          membersArray.push(data)
        }
      }

      this.items = membersArray
    },

    async handleRole({ membershipId, organizationId, personId, selectedRole }) {
      try {
        if (!membershipId) {
          const data = {
            organization_id: organizationId,
            person_id: personId,
            roles: [selectedRole]
          }

          await this.create(data)
        } else {
          const data = {
            roles: [selectedRole]
          }

          await this.patch([membershipId, { $set: data }, {}])
        }
      } catch (err) {
        this.$bus.$emit('status', {
          type: 'error',
          message: err.message
        })
      } finally {
        if (this.selectedPerson) {
          this.membershipsPersonOuterJoin()
        } else {
          this.membershipsOrgOuterJoin()
        }
      }
    },

    async membershipsPersonOuterJoin() {
      const { selectedPerson, organizationList, selectedRoles } = this

      const ablityOrg = organizationList.filter(item =>
        this.$canCreate('memberships', item)
      )
      const membersArray = []

      const membersList = await this.fetchMemberships({
        query: { person_id: selectedPerson._id }
      })

      for (let i = 0; i < ablityOrg.length; i++) {
        const member = membersList.data.find(
          mem => mem.organization_id === ablityOrg[i]._id
        )

        const data = {
          role: member && member.roles && member.roles[0],
          membership_id: member && member._id,
          organization_id: ablityOrg[i] && ablityOrg[i]._id,
          person_id: selectedPerson._id,
          ...ablityOrg[i]
        }

        if (selectedRoles && selectedRoles.length) {
          if (
            member &&
            member.roles &&
            selectedRoles.includes(member.roles[0])
          ) {
            membersArray.push(data)
          }

          if (!member && selectedRoles.includes('none')) {
            membersArray.push(data)
          }
        } else {
          membersArray.push(data)
        }

        membersArray.push()
      }

      this.items = membersArray
    },

    async handleRemove(item) {
      try {
        await this.removeMemberships([item.membership_id])
        if (this.selectedOrganization) {
          this.membershipsOrgOuterJoin()
        } else {
          this.membershipsPersonOuterJoin()
        }
      } catch (err) {
        this.$bus.$emit('status', { type: 'error', message: err.message })
      }
    }
  }
}
</script>

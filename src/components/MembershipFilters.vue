<template>
  <v-row>
    <v-col cols="12" md="4">
      <v-autocomplete
        :value="selectedOrganization"
        :item-text="
          organization =>
            organization.is_enabled
              ? organization.full_name
              : `${organization.full_name} (disabled)`
        "
        label="Organizations"
        :items="organizationList"
        chips
        deletable-chips
        dense
        filled
        flat
        hide-details
        hide-no-data
        return-object
        small-chips
        @change="$emit('handle-organization', $event)"
      ></v-autocomplete>
    </v-col>

    <v-col cols="12" md="4">
      <v-autocomplete
        :value="selectedPerson"
        :item-text="
          person =>
            person.is_enabled
              ? person.name + ' | ' + person.email
              : `${person.name} (disabled)`
        "
        label="Users"
        :items="persons"
        chips
        deletable-chips
        dense
        filled
        flat
        hide-details
        hide-no-data
        return-object
        small-chips
        @change="$emit('handle-person', $event)"
      >
      </v-autocomplete>
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        :value="selectedRoles"
        :items="rolesOption"
        chips
        deletable-chips
        dense
        label="Roles"
        filled
        flat
        hide-details
        multiple
        small-chips
        @change="$emit('handle-roles', $event)"
      ></v-select>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    selectedOrganization: { default: null, type: Object },
    selectedPerson: { default: null, type: Object },
    selectedRoles: { default: null, type: Array },
    rolesOption: { default: null, type: Array }
  },

  computed: {
    ...mapGetters({
      organizations: 'organizations/list',
      persons: 'persons/list'
    }),

    organizationList() {
      return this.organizations.filter(item =>
        this.$canCreate('memberships', item)
      )
    }
  }

  // Feature for router query  eg: memberships?personId=63f6396b4c8684b9cea8f40f
  // mounted() {
  //   const { personId, organizationId, roles } = this.$route.query

  //   if (organizationId) {
  //     const organization = this.organizations.find(
  //       org => org._id === organizationId
  //     )
  //     this.$emit('handle-organization', organization)
  //   } else if (personId) {
  //     const person = this.persons.find(per => per._id === personId)
  //     this.$emit('handle-person', person)
  //   }

  //   if (roles) {
  //     this.$emit('handle-roles', Array.isArray(roles) ? roles : [roles])
  //   }
  // }
}
</script>

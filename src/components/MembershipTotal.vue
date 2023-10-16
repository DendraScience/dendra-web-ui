<template>
  <feathers-vuex-find
    v-slot="{ pagination }"
    :query="totalQuery"
    service="memberships"
  >
    <v-card v-if="pagination" color="grey darken-2" dark hover>
      <v-card :to="viewTo" color="transparent" flat nuxt>
        <v-card-title>
          <v-icon class="mr-2" dark>{{ mdiWalletMembership }}</v-icon
          >Memberships
        </v-card-title>

        <v-card-text class="display-1 text-truncate">
          {{ pagination | get('total', 0) }}
          <small class="font-weight-light">{{ totalLabel }}</small>
        </v-card-text>
      </v-card>

      <slot v-if="!hideActions" name="actions">
        <v-divider />

        <v-card-actions>
          <v-btn :to="viewTo" dark nuxt text>View</v-btn>
        </v-card-actions>
      </slot>
    </v-card>
  </feathers-vuex-find>
</template>

<script>
export default {
  props: {
    organizationId: { default: null, type: String },
    personId: { default: null, type: String },
    hideActions: { default: false, type: Boolean },
    totalLabel: { default: 'total', type: String }
  },

  computed: {
    totalQuery() {
      const query = {
        $limit: 0
      }

      if (this.organizationId) query.organization_id = this.organizationId

      if (this.personId) query.person_id = this.personId

      return query
    },

    viewTo() {
      const to = {
        name: 'memberships',
        query: {}
      }

      if (this.organizationId) to.query.organizationId = this.organizationId

      if (this.personId) to.query.personId = this.personId

      return to
    }
  }
}
</script>

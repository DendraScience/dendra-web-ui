<template>
  <feathers-vuex-find
    v-slot="{ pagination }"
    :query="totalQuery"
    service="thing-types"
  >
    <v-card v-if="pagination" color="orange" dark hover>
      <v-card :to="viewTo" color="transparent" flat nuxt>
        <v-card-title class="title">
          <v-icon class="mr-2" dark>{{ mdiHexagonSlice6 }}</v-icon
          >Equipments
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
    company: { default: null, type: Object },
    hideActions: { default: false, type: Boolean },
    isEnabled: { default: null, type: [Boolean, String] },
    showDisabled: { default: false, type: Boolean },
    totalLabel: { default: 'total', type: String }
  },

  computed: {
    totalQuery() {
      const query = {
        $limit: 0
      }

      if (this.isEnabled !== null) query.is_enabled = this.isEnabled
      else if (!this.showDisabled) query.is_enabled = true

      if (this.company)
        query.$or = [
          { oem_company_id: this.company._id },
          { reseller_company_id: this.company._id }
        ]

      return query
    },

    viewTo() {
      const to = {
        name: 'equipments',
        query: {}
      }

      if (this.isEnabled !== null) to.query.isEnabled = this.isEnabled

      if (this.company) to.query.companyId = this.company._id

      return to
    }
  }
}
</script>

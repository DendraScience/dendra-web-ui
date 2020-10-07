<template>
  <feathers-vuex-find
    v-slot="{ pagination }"
    :query="totalQuery"
    service="stations"
  >
    <v-card v-if="pagination" color="green" dark hover>
      <v-card :to="viewTo" color="transparent" flat nuxt>
        <v-card-title class="title">
          <v-icon class="mr-2" dark>{{ mdiNature }}</v-icon
          >Stations
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

          <v-btn
            :to="{
              name: 'orgs-orgSlug-status',
              params: {
                orgSlug: org.slug
              }
            }"
            dark
            nuxt
            text
            >Status</v-btn
          >
        </v-card-actions>
      </slot>
    </v-card>
  </feathers-vuex-find>
</template>

<script>
export default {
  props: {
    annotation: { default: null, type: Object },
    hideActions: { default: false, type: Boolean },
    isEnabled: { default: null, type: [Boolean, String] },
    org: { default: null, type: Object },
    showDisabled: { default: false, type: Boolean },
    totalLabel: { default: 'total', type: String }
  },

  computed: {
    totalQuery() {
      const query = {
        is_hidden: false,
        organization_id: this.org._id,
        $limit: 0
      }

      if (this.isEnabled !== null) query.is_enabled = this.isEnabled
      else if (!this.showDisabled) query.is_enabled = true

      if (this.annotation)
        query._id = { $in: this.annotation.affected_station_ids || [] }

      return query
    },

    viewTo() {
      const to = {
        name: 'orgs-orgSlug-stations',
        params: {
          orgSlug: this.org.slug
        },
        query: {}
      }

      if (this.isEnabled !== null) to.query.isEnabled = this.isEnabled

      if (this.annotation) to.query.annotationId = this.annotation._id

      return to
    }
  }
}
</script>

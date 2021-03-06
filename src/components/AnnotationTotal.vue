<template>
  <feathers-vuex-find
    v-slot="{ pagination }"
    :query="totalQuery"
    service="annotations"
  >
    <v-card v-if="pagination" color="purple" dark hover>
      <v-card :to="viewTo" color="transparent" flat nuxt>
        <v-card-title>
          <v-icon class="mr-2" dark>{{ mdiNoteOutline }}</v-icon
          >Annotations
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
    datastreamId: { default: null, type: String },
    hideActions: { default: false, type: Boolean },
    isEnabled: { default: null, type: [Boolean, String] },
    org: { default: null, type: Object },
    showDisabled: { default: false, type: Boolean },
    stationId: { default: '', type: String },
    totalLabel: { default: 'total', type: String }
  },

  computed: {
    totalQuery() {
      const query = {
        organization_id: this.org._id,
        $limit: 0
      }

      if (this.isEnabled !== null) query.is_enabled = this.isEnabled
      else if (!this.showDisabled) query.is_enabled = true

      if (this.datastreamId) query.datastream_ids = this.datastreamId

      if (this.stationId) query.affected_station_ids = this.stationId

      return query
    },

    viewTo() {
      const to = {
        name: 'orgs-orgSlug-annotations',
        params: {
          orgSlug: this.org.slug
        },
        query: {}
      }

      if (this.isEnabled !== null) to.query.isEnabled = this.isEnabled

      if (this.datastreamId) to.query.datastreamId = this.datastreamId

      if (this.stationId) to.query.stationId = this.stationId

      return to
    }
  }
}
</script>

<template>
  <feathers-vuex-find
    v-slot="{ pagination }"
    :query="totalQuery"
    service="datastreams"
  >
    <v-card v-if="pagination" color="blue" dark hover>
      <v-card :to="viewTo" color="transparent" flat nuxt>
        <v-card-title>
          <v-icon class="mr-2" dark>{{ mdiChartTimelineVariant }}</v-icon
          >Datastreams
        </v-card-title>
        <v-card-subtitle v-if="showOrg">
          {{ org.name }}
        </v-card-subtitle>

        <v-card-text class="display-1 text-truncate">
          {{ pagination | get('total', 0) }}
          <small class="font-weight-light">{{ totalLabel }}</small>
        </v-card-text>
      </v-card>

      <slot v-if="!hideActions" name="actions">
        <v-divider />

        <v-card-actions>
          <v-btn :to="viewTo" dark nuxt text>View</v-btn>
          <v-btn :to="queryTo" dark nuxt text>Query</v-btn>
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
    isHidden: { default: null, type: [Boolean, String] },
    org: { default: null, type: Object },
    showDisabled: { default: false, type: Boolean },
    showHidden: { default: false, type: Boolean },
    showOrg: { default: false, type: Boolean },
    stationId: { default: '', type: String },
    thingTypeId: { default: '', type: String },
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

      if (this.isHidden !== null) query.is_hidden = this.isHidden
      else if (!this.showHidden) query.is_hidden = false

      if (this.stationId) query.station_id = this.stationId

      if (this.thingTypeId) query.thing_type_id = this.thingTypeId

      if (this.annotation)
        query.$or = [
          { _id: { $in: this.annotation.datastream_ids || [] } },
          { station_id: { $in: this.annotation.station_ids || [] } }
        ]

      return query
    },

    queryTo() {
      const to = {
        name: 'orgs-orgSlug-datastreams',
        params: {
          orgSlug: this.org.slug
        },
        query: {
          faceted: true,
          scheme: 'dq'
        }
      }

      if (this.isEnabled !== null) to.query.isEnabled = this.isEnabled

      if (this.stationId) to.query.stationId = this.stationId

      return to
    },

    viewTo() {
      const to = {
        name: 'orgs-orgSlug-datastreams',
        params: {
          orgSlug: this.org.slug
        },
        query: {}
      }

      if (this.isEnabled !== null) to.query.isEnabled = this.isEnabled

      if (this.stationId) to.query.stationId = this.stationId

      if (this.thingTypeId) to.query.thingTypeId = this.thingTypeId

      if (this.annotation) to.query.annotationId = this.annotation._id

      return to
    }
  }
}
</script>

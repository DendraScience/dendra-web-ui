<template>
  <v-container v-if="org">
    <v-row dense>
      <v-col>
        <v-tabs v-model="tabIndex" grow>
          <v-tab>
            View
          </v-tab>

          <v-tab-item>
            <v-card tile>
              <query-header name="annotations" :org="org">
                Annotations
              </query-header>

              <annotation-search
                :datastream-id="queryDatastreamId"
                :is-enabled="queryIsEnabled"
                :org="org"
                :show-disabled="showOutliers"
                :show-options="showOutliers"
                :station-id="queryStationId"
                show-link
              >
                <template v-slot:actions="{ item }">
                  <v-icon color="tertiary" @click="open(item._id)">{{
                    mdiOpenInNew
                  }}</v-icon>
                </template>
              </annotation-search>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>

    <v-btn
      v-show="$canCreate('annotations', org, { state: 'pending' })"
      :to="{
        name: 'orgs-orgSlug-annotations-create',
        params: {
          orgSlug: org.slug
        }
      }"
      color="secondary"
      dark
      exact
      fab
      fixed
      nuxt
      right
      style="top: 80px;"
      top
    >
      <v-icon>{{ mdiPlus }}</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import routeQuery from '@/mixins/route-query'
import AnnotationSearch from '@/components/AnnotationSearch'
import QueryHeader from '@/components/QueryHeader'

export default {
  components: {
    AnnotationSearch,
    QueryHeader
  },

  middleware: ['check-org', 'fetch-station', 'fetch-datastream'],

  mixins: [routeQuery],

  data: () => ({
    tabIndex: 0
  }),

  computed: {
    ...mapGetters(['org']),
    ...mapGetters({
      getStation: 'stations/get'
    }),

    showOutliers() {
      return this.$canCreate('annotations', this.org)
    }
  },

  methods: {
    open(annotationId) {
      window.open(
        this.$router.resolve({
          name: 'orgs-orgSlug-annotations-annotationId',
          params: {
            orgSlug: this.org.slug,
            annotationId
          }
        }).href,
        '_blank'
      )
    }
  }
}
</script>

<template>
  <v-container v-if="org">
    <v-row dense>
      <v-col>
        <v-tabs v-model="tabIndex" grow>
          <v-tab> View </v-tab>

          <v-tab-item>
            <v-card outlined tile>
              <query-header name="stations" :org="org"> Stations </query-header>

              <station-search
                :annotation="annotation"
                :is-enabled="queryIsEnabled"
                :org="org"
                :show-disabled="showOutliers"
                :show-hidden="showOutliers"
                show-link
              >
                <template #actions="{ item }">
                  <v-icon
                    color="tertiary"
                    class="mr-2"
                    @click="
                      $router.push({
                        name: 'orgs-orgSlug-datastreams',
                        params: {
                          orgSlug: org.slug
                        },
                        query: {
                          stationId: item._id
                        }
                      })
                    "
                    >{{ mdiChartTimelineVariant }}</v-icon
                  >

                  <v-icon color="tertiary" @click="open(item._id)">{{
                    mdiOpenInNew
                  }}</v-icon>
                </template>
              </station-search>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>

    <v-btn
      v-show="$canCreate('stations', org)"
      :to="{
        name: 'orgs-orgSlug-stations-create',
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
      style="top: 80px"
      top
    >
      <v-icon>{{ mdiPlus }}</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import routeQuery from '@/mixins/route-query'
import QueryHeader from '@/components/QueryHeader'
import StationSearch from '@/components/StationSearch'

export default {
  components: {
    QueryHeader,
    StationSearch
  },

  mixins: [routeQuery],

  middleware: ['check-org', 'fetch-annotation'],

  data: () => ({
    tabIndex: 0
  }),

  computed: {
    ...mapGetters(['org']),
    ...mapGetters({
      getAnnotation: 'annotations/get'
    }),

    annotation() {
      return this.queryAnnotationId
        ? this.getAnnotation(this.queryAnnotationId)
        : null
    },

    showOutliers() {
      return this.annotation || this.$canCreate('stations', this.org)
    }
  },

  methods: {
    open(stationId) {
      window.open(
        this.$router.resolve({
          name: 'orgs-orgSlug-stations-stationId',
          params: {
            orgSlug: this.org.slug,
            stationId
          }
        }).href,
        '_blank'
      )
    }
  }
}
</script>

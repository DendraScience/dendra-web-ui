<template>
  <v-container>
    <v-row dense>
      <v-col>
        <v-tabs v-model="tabIndex" grow>
          <v-tab> View </v-tab>

          <v-tab-item>
            <v-card outlined tile>
              <query-header name="equipment"> Equipment </query-header>

              <thing-type-search
                :company-id="queryCompanyId"
                :is-enabled="queryIsEnabled"
                :show-disabled="showOutliers"
                :show-options="showOutliers"
                show-link
              >
                <template #actions="{ item }">
                  <v-icon color="tertiary" @click="open(item._id)">{{
                    mdiOpenInNew
                  }}</v-icon>
                </template>
              </thing-type-search>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>

    <v-btn
      v-show="$canCreate('thing-types')"
      :to="{
        name: 'equipment-create'
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
import routeQuery from '@/mixins/route-query'
import QueryHeader from '@/components/QueryHeader'
import ThingTypeSearch from '@/components/ThingTypeSearch'

export default {
  components: {
    QueryHeader,
    ThingTypeSearch
  },

  mixins: [routeQuery],

  middleware: ['no-org', 'fetch-company'],

  data: () => ({
    tabIndex: 0
  }),

  computed: {
    showOutliers() {
      return this.$canCreate('thing-types')
    }
  },

  methods: {
    open(thingTypeId) {
      window.open(
        this.$router.resolve({
          name: 'equipment-thingTypeId',
          params: {
            thingTypeId
          }
        }).href,
        '_blank'
      )
    }
  }
}
</script>

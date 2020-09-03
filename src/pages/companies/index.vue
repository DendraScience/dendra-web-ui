<template>
  <v-container>
    <v-row dense>
      <v-col>
        <v-tabs v-model="tabIndex" grow>
          <v-tab>
            View
          </v-tab>

          <v-tab-item>
            <v-card tile>
              <query-header name="companies">
                Companies
              </query-header>

              <company-search show-link>
                <template v-slot:actions="{ item }">
                  <v-icon
                    color="tertiary"
                    class="mr-2"
                    @click="
                      $router.push({
                        name: 'equipments',
                        query: {
                          companyId: item._id
                        }
                      })
                    "
                    >{{ mdiHexagonSlice6 }}</v-icon
                  >

                  <v-icon color="tertiary" @click="open(item._id)">{{
                    mdiOpenInNew
                  }}</v-icon>
                </template>
              </company-search>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>

    <v-btn
      v-show="$canCreate('companies')"
      :to="{
        name: 'companies-create'
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
import routeQuery from '@/mixins/route-query'
import CompanySearch from '@/components/CompanySearch'
import QueryHeader from '@/components/QueryHeader'

export default {
  components: {
    CompanySearch,
    QueryHeader
  },

  middleware: ['no-org'],

  mixins: [routeQuery],

  data: () => ({
    tabIndex: 0
  }),

  methods: {
    open(companyId) {
      window.open(
        this.$router.resolve({
          name: 'companies-companyId',
          params: {
            companyId
          }
        }).href,
        '_blank'
      )
    }
  }
}
</script>

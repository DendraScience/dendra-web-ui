<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout column>
          <v-flex>
            <v-tabs
              v-model="tabIndex"
              background-color="grey lighten-2"
              fixed-tabs
            >
              <v-tab>
                View
              </v-tab>

              <v-tab-item>
                <v-card flat>
                  <v-card-title class="headline">
                    Stations
                  </v-card-title>

                  <station-search
                    :is-enabled="queryIsEnabled"
                    :org="org"
                    :show-disabled="$can('create', 'stations')"
                    :show-hidden="$can('create', 'stations')"
                    show-link
                  >
                    <template v-slot:actions="{ item }">
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
                        >mdi-chart-timeline-variant</v-icon
                      >

                      <v-icon color="tertiary" @click="open(item._id)"
                        >mdi-open-in-new</v-icon
                      >
                    </template>
                  </station-search>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-btn
      v-if="
        $can('create', {
          organization_id: org._id,
          state: 'pending',
          [$abilityTypeKey]: 'stations'
        })
      "
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
      style="top: 80px;"
      top
    >
      <v-icon>add</v-icon>
    </v-btn>
  </v-layout>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import StationSearch from '@/components/StationSearch'

export default {
  components: {
    StationSearch
  },

  middleware: ['check-org'],

  data: () => ({
    tabIndex: 0
  }),

  computed: {
    // TODO: Remove cart helpers?
    ...mapGetters(['org']),
    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids'
    }),

    ...mapState('cart', ['quantitiesById']),

    queryIsEnabled() {
      return this.$route.query.isEnabled
    }
  },

  created() {
    this.resetCart()
  },

  methods: {
    ...mapMutations({
      resetCart: 'cart/reset',
      setQuantity: 'cart/setQuantity'
    }),

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

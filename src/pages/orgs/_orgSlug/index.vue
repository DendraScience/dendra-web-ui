<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout>
          <v-flex xs12>
            <h2 class="display-3 font-weight-light mb-2">{{ org.name }}</h2>

            <p class="subheading">
              {{ org.description }}
            </p>
          </v-flex>
        </v-layout>

        <v-layout wrap mt-6>
          <feathers-vuex-find
            v-slot="{ pagination }"
            :query="{
              is_enabled: true,
              is_hidden: false,
              organization_id: org._id,
              $limit: 0
            }"
            service="stations"
          >
            <v-flex v-if="pagination" xs12 sm4>
              <v-hover v-slot="{ hover }">
                <v-card
                  :class="`elevation-${hover ? 8 : 2}`"
                  color="accent"
                  class="white--text"
                >
                  <v-card-title class="headline">
                    <span class="text-truncate"
                      >{{ pagination | get('total', 0) }} stations</span
                    >
                  </v-card-title>
                  <v-card-actions>
                    <v-btn
                      :to="{
                        name: 'orgs-orgSlug-stations',
                        params: {
                          orgSlug: org.slug
                        }
                      }"
                      exact
                      dark
                      nuxt
                      text
                      >Map</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-flex>
          </feathers-vuex-find>

          <feathers-vuex-find
            v-slot="{ pagination }"
            :query="{
              is_enabled: true,
              is_hidden: false,
              organization_id: org._id,
              $limit: 0
            }"
            service="datastreams"
          >
            <v-flex v-if="pagination" xs12 sm4>
              <v-hover v-slot="{ hover }">
                <v-card
                  :class="`elevation-${hover ? 8 : 2}`"
                  color="accent"
                  class="white--text"
                >
                  <v-card-title class="headline">
                    <span class="text-truncate">
                      {{ pagination | get('total', 0) }} datastreams</span
                    >
                  </v-card-title>
                  <v-card-actions>
                    <v-btn
                      :to="{
                        name: 'orgs-orgSlug-datastreams',
                        params: {
                          orgSlug: org.slug
                        }
                      }"
                      exact
                      dark
                      nuxt
                      text
                      >Search</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-flex>
          </feathers-vuex-find>
        </v-layout>

        <v-layout wrap>
          <feathers-vuex-find
            v-slot="{ pagination }"
            :query="{
              is_enabled: true,
              organization_id: org._id,
              $limit: 0
            }"
            service="annotations"
          >
            <v-flex v-if="pagination" xs12 sm4>
              <v-hover v-slot="{ hover }">
                <v-card
                  :class="`elevation-${hover ? 8 : 2}`"
                  color="accent"
                  class="white--text"
                >
                  <v-card-title class="headline">
                    <span class="text-truncate"
                      >{{ pagination | get('total', 0) }} annotations</span
                    >
                  </v-card-title>
                  <v-card-actions>
                    <v-btn
                      :to="{
                        name: 'orgs-orgSlug-annotations',
                        params: {
                          orgSlug: org.slug
                        }
                      }"
                      exact
                      dark
                      nuxt
                      text
                      >Search</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-flex>
          </feathers-vuex-find>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  middleware: ['check-org'],

  computed: {
    ...mapGetters(['org'])
  }
}
</script>

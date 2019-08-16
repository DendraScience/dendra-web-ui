<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout>
          <v-flex xs12>
            <h2 class="display-3 font-weight-light mb-2">{{ org.name }}</h2>

            <p>
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
              <v-card color="green" dark hover>
                <v-card
                  :to="{
                    name: 'orgs-orgSlug-stations',
                    params: {
                      orgSlug: org.slug
                    }
                  }"
                  color="transparent"
                  flat
                  nuxt
                >
                  <v-card-title class="title">
                    <v-icon class="mr-2" dark>mdi-nature</v-icon> stations
                  </v-card-title>

                  <v-card-text class="display-2 text-truncate">
                    {{ pagination | get('total', 0) }}
                    <small class="font-weight-light">total</small>
                  </v-card-text>
                </v-card>

                <v-divider />

                <v-card-actions>
                  <v-btn
                    :to="{
                      name: 'orgs-orgSlug-stations',
                      params: {
                        orgSlug: org.slug
                      }
                    }"
                    dark
                    nuxt
                    text
                    >Search</v-btn
                  >

                  <v-btn
                    :to="{
                      name: 'orgs-orgSlug-stationStatus',
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
              </v-card>
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
              <v-card color="blue" dark hover>
                <v-card
                  :to="{
                    name: 'orgs-orgSlug-datastreams',
                    params: {
                      orgSlug: org.slug
                    }
                  }"
                  color="transparent"
                  flat
                  nuxt
                >
                  <v-card-title class="title">
                    <v-icon class="mr-2" dark
                      >mdi-chart-timeline-variant</v-icon
                    >
                    datastreams
                  </v-card-title>

                  <v-card-text class="display-2 text-truncate">
                    {{ pagination | get('total', 0) }}
                    <small class="font-weight-light">total</small>
                  </v-card-text>
                </v-card>

                <v-divider />

                <v-card-actions>
                  <v-btn
                    :to="{
                      name: 'orgs-orgSlug-datastreams',
                      params: {
                        orgSlug: org.slug
                      }
                    }"
                    dark
                    nuxt
                    text
                    >Search</v-btn
                  >
                </v-card-actions>
              </v-card>
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
              <v-card color="purple" dark hover>
                <v-card
                  :to="{
                    name: 'orgs-orgSlug-annotations',
                    params: {
                      orgSlug: org.slug
                    }
                  }"
                  color="transparent"
                  flat
                  nuxt
                >
                  <v-card-title class="title">
                    <v-icon class="mr-2" dark>mdi-note-outline</v-icon>
                    annotations
                  </v-card-title>

                  <v-card-text class="display-2 text-truncate">
                    {{ pagination | get('total', 0) }}
                    <small class="font-weight-light">total</small>
                  </v-card-text>
                </v-card>

                <v-divider />

                <v-card-actions>
                  <v-btn
                    :to="{
                      name: 'orgs-orgSlug-annotations',
                      params: {
                        orgSlug: org.slug
                      }
                    }"
                    dark
                    nuxt
                    text
                    >Search</v-btn
                  >
                </v-card-actions>
              </v-card>
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

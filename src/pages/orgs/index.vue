<template>
  <v-layout column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout>
          <v-flex xs12>
            <h3 class="display-2 font-weight-light mb-2">Organizations</h3>
          </v-flex>
        </v-layout>

        <feathers-vuex-find
          v-slot="{ items: organizations }"
          :query="{ is_enabled: true, $sort: { sort_value: 1, name: 1 } }"
          service="organizations"
        >
          <v-layout wrap>
            <v-flex
              v-for="organization in organizations"
              :key="organization._id"
              xs12
              md6
            >
              <v-card hover>
                <v-list two-line>
                  <v-list-item
                    :to="{
                      name: 'orgs-orgSlug',
                      params: { orgSlug: organization.slug }
                    }"
                    nuxt
                  >
                    <v-list-item-content>
                      <v-list-item-title class="headline">{{
                        organization.name
                      }}</v-list-item-title>

                      <v-list-item-subtitle>{{
                        organization.description
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>

                <v-divider />

                <v-list>
                  <v-list-item
                    :disabled="!organization.slug"
                    :to="{
                      name: 'orgs-orgSlug-stationStatus',
                      params: { orgSlug: organization.slug }
                    }"
                    nuxt
                  >
                    <v-list-item-action
                      ><v-icon>check_circle</v-icon></v-list-item-action
                    >
                    <v-list-item-content>
                      <v-list-item-title>Station status</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item
                    :disabled="!organization.slug"
                    :to="{
                      name: 'orgs-orgSlug-datastreams',
                      params: { orgSlug: organization.slug },
                      query: {
                        faceted: true,
                        scheme: 'dq'
                      }
                    }"
                    nuxt
                  >
                    <v-list-item-action
                      ><v-icon
                        >mdi-chart-timeline-variant</v-icon
                      ></v-list-item-action
                    >
                    <v-list-item-content>
                      <v-list-item-title>Data query</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item
                    :disabled="!organization.slug"
                    :to="{
                      name: 'orgs-orgSlug-datastreams',
                      params: { orgSlug: organization.slug }
                    }"
                    nuxt
                  >
                    <v-list-item-action
                      ><v-icon
                        >mdi-chart-timeline-variant</v-icon
                      ></v-list-item-action
                    >
                    <v-list-item-content>
                      <v-list-item-title>View datastreams</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item
                    :disabled="!organization.slug"
                    :to="{
                      name: 'orgs-orgSlug-annotations',
                      params: { orgSlug: organization.slug }
                    }"
                    nuxt
                  >
                    <v-list-item-action
                      ><v-icon>mdi-note-outline</v-icon></v-list-item-action
                    >
                    <v-list-item-content>
                      <v-list-item-title>View annotations</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item
                    :disabled="!organization.url"
                    :href="organization.url"
                    target="_blank"
                  >
                    <v-list-item-action
                      ><v-icon>open_in_browser</v-icon></v-list-item-action
                    >
                    <v-list-item-content>
                      <v-list-item-title>Visit website</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-flex>
          </v-layout>
        </feathers-vuex-find>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  middleware: ['no-org']
}
</script>

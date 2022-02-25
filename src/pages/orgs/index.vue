<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light my-2">Organizations</h2>
      </v-col>
    </v-row>

    <feathers-vuex-find
      v-slot="{ items: organizations }"
      :query="{
        is_enabled: true,
        is_hidden: false,
        $sort: { sort_value: 1, name: 1 }
      }"
      service="organizations"
    >
      <v-row>
        <v-col
          v-for="organization in organizations"
          :key="organization._id"
          cols="12"
          md="6"
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
                  name: 'orgs-orgSlug-status',
                  params: { orgSlug: organization.slug }
                }"
                nuxt
              >
                <v-list-item-action
                  ><v-icon>{{ mdiCheckCircle }}</v-icon></v-list-item-action
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
                  ><v-icon>{{ mdiChartMultiple }}</v-icon></v-list-item-action
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
                  ><v-icon>{{
                    mdiChartTimelineVariant
                  }}</v-icon></v-list-item-action
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
                  ><v-icon>{{ mdiNoteOutline }}</v-icon></v-list-item-action
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
                  ><v-icon>{{ mdiOpenInApp }}</v-icon></v-list-item-action
                >
                <v-list-item-content>
                  <v-list-item-title>Visit website</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </feathers-vuex-find>
  </v-container>
</template>

<script>
export default {
  middleware: ['no-org']
}
</script>

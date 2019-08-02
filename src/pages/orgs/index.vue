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
              <v-hover v-slot="{ hover }">
                <v-card
                  :class="`elevation-${hover ? 8 : 2}`"
                  style="display: flex; flex-direction: column;"
                >
                  <v-card-title
                    :style="organization.slug ? { cursor: 'pointer' } : {}"
                    @click="
                      $router.push({
                        name: 'orgs-orgSlug',
                        params: { orgSlug: organization.slug }
                      })
                    "
                  >
                    <div class="text-truncate mb-2">
                      {{ organization.name }}
                    </div>
                    <div class="text-truncate body-2">
                      {{ organization.description }}
                    </div>
                  </v-card-title>

                  <v-divider />

                  <v-list>
                    <v-list-item
                      :disabled="!organization.slug"
                      :to="{
                        name: 'orgs-orgSlug-stations',
                        params: { orgSlug: organization.slug }
                      }"
                    >
                      <v-list-item-action> </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Stations map</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item
                      :disabled="!organization.slug"
                      :to="{
                        name: 'orgs-orgSlug-datastreams',
                        params: { orgSlug: organization.slug }
                      }"
                    >
                      <v-list-item-action> </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title
                          >Datastreams search</v-list-item-title
                        >
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item
                      :disabled="!organization.slug"
                      :to="{
                        name: 'orgs-orgSlug-annotations',
                        params: { orgSlug: organization.slug }
                      }"
                    >
                      <v-list-item-action> </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title
                          >Annotations search</v-list-item-title
                        >
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
              </v-hover>
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

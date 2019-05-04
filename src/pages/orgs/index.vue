<template>
  <v-layout column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout row>
          <v-flex xs12>
            <h3 class="display-2 mb-2">Organizations</h3>
          </v-flex>
        </v-layout>

        <feathers-vuex-find
          :query="{ $sort: { sort_value: 1, name: 1 } }"
          service="organizations"
        >
          <v-layout slot-scope="{ items: organizations }" row wrap>
            <v-flex
              v-for="organization in organizations"
              :key="organization._id"
              xs12
              md6
              d-flex
            >
              <v-hover>
                <v-card
                  slot-scope="{ hover }"
                  :class="`elevation-${hover ? 8 : 2}`"
                  style="display: flex; flex-direction: column;"
                >
                  <v-card-text
                    class="grow"
                    :style="organization.slug ? { cursor: 'pointer' } : {}"
                    @click="doIt"
                  >
                    <h4 class="display-1 mb-2">{{ organization.name }}</h4>
                    <p class="subheading">{{ organization.description }}</p>
                  </v-card-text>

                  <v-card-actions>
                    <v-btn
                      v-if="organization.url"
                      :href="organization.url"
                      color="primary"
                      flat
                      target="_blank"
                    >
                      Website</v-btn
                    >

                    <v-spacer />

                    <v-btn
                      v-if="organization.slug"
                      :to="{
                        name: 'orgs-orgSlug',
                        params: { orgSlug: organization.slug }
                      }"
                      color="primary"
                      flat
                      icon
                      nuxt
                      ><v-icon>home</v-icon></v-btn
                    >

                    <v-menu v-if="organization.slug" left offset-y>
                      <template v-slot:activator="{ on }">
                        <v-btn color="primary" flat icon v-on="on">
                          <v-icon>more_vert</v-icon>
                        </v-btn>
                      </template>

                      <v-list>
                        <v-list-tile>
                          <v-list-tile-title>Stations</v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-title>Datastreams</v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                  </v-card-actions>
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
  middleware: ['no-org'],

  methods: {
    doIt() {
      this.$logger.log('Did it!')
    }
  }
}
</script>

<template>
  <v-container>
    <v-row dense>
      <v-col>
        <v-tabs v-model="tabIndex" grow>
          <v-tab> View </v-tab>

          <v-tab-item>
            <v-card outlined tile>
              <v-container fluid>
                <v-row dense>
                  <v-col>
                    <h2 class="headline">Organizations</h2>
                  </v-col>
                </v-row>
              </v-container>

              <organizations-search show-link />
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>

    <v-btn
      v-show="$canCreate('organizations')"
      :to="{
        name: 'organizations-create'
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
import OrganizationsSearch from '@/components/OrganizationsSearch'

export default {
  components: {
    OrganizationsSearch
  },

  middleware: ['no-org', 'no-auth-redirect-home'],

  data: () => ({
    tabIndex: 0
  })
}
</script>

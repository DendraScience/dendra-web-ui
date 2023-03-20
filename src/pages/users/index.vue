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
                    <h2 class="headline">Users</h2>
                  </v-col>
                </v-row>
              </v-container>

              <users-search show-link>
                <template #actions="{ item }">
                  <v-icon color="tertiary" @click="open(item._id)">{{
                    mdiOpenInNew
                  }}</v-icon>
                </template>
              </users-search>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>

    <v-btn
      v-show="$canCreate('users')"
      :to="{
        name: 'users-create'
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
import UsersSearch from '@/components/UsersSearch'

export default {
  components: {
    UsersSearch
  },

  middleware: ['no-org', 'no-auth-redirect-home'],

  data: () => ({
    tabIndex: 0
  }),

  methods: {
    open(userId) {
      window.open(
        this.$router.resolve({
          name: 'users-userId',
          params: {
            userId
          }
        }).href,
        '_blank'
      )
    }
  }
}
</script>

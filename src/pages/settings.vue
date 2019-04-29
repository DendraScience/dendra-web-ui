<template>
  <v-layout column>
    <v-flex px-1>
      <v-alert
        :value="status"
        :type="status && status.type"
        dismissible
        transition="slide-y-transition"
      >
        {{ status && status.message }}
      </v-alert>
    </v-flex>

    <v-flex>
      <v-container grid-list-lg>
        <v-layout row>
          <v-flex xs12>
            <h3 class="display-2 mb-2">User settings</h3>
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex xs12 sm8>
            <user-account-card
              :user="getUser(auth.user._id)"
              @status="status = $event"
            />
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex xs12 sm8>
            <user-password-card
              :user="getUser(auth.user._id)"
              @status="status = $event"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import UserAccountCard from '@/components/UserAccountCard'
import UserPasswordCard from '@/components/UserPasswordCard'

import { mapGetters, mapState } from 'vuex'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    UserAccountCard,
    UserPasswordCard
  },

  middleware: ['no-auth-redirect-login'],

  data: () => ({
    status: null
  }),

  computed: {
    ...mapGetters({
      getUser: 'users/get'
    }),

    ...mapState(['auth'])
  },

  async fetch({ app, store }) {
    const { auth } = store.state

    await store.dispatch('users/get', auth.user._id)
  },

  methods: {}
}
</script>

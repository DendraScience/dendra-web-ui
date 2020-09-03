<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light mb-2">User settings</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <user-account-edit :user="getUser(auth.user._id)" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <user-password-edit :user="getUser(auth.user._id)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import UserAccountEdit from '@/components/UserAccountEdit'
import UserPasswordEdit from '@/components/UserPasswordEdit'

export default {
  components: {
    UserAccountEdit,
    UserPasswordEdit
  },

  middleware: ['no-org', 'no-auth-redirect-login'],

  async fetch({ store }) {
    const { auth } = store.state

    await store.dispatch('users/get', auth.user._id)
  },

  computed: {
    ...mapGetters({
      getUser: 'users/get'
    }),

    ...mapState(['auth'])
  },

  methods: {
    ...mapActions('auth', ['authenticate'])
  }
}
</script>

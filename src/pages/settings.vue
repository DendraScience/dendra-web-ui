<template>
  <v-container v-if="auth.user">
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light my-2">User settings</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <user-account-edit :user="getUser(auth.user._id)" />
      </v-col>
    </v-row>

    <v-row v-if="isLocal">
      <v-col cols="12" lg="8">
        <user-password-edit :user="getUser(auth.user._id)" />
      </v-col>
    </v-row>

    <v-row v-if="isLocal">
      <v-col cols="12" lg="8">
        <user-migrate :user="getUser(auth.user._id)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import UserAccountEdit from '@/components/UserAccountEdit'
import UserMigrate from '@/components/UserMigrate'
import UserPasswordEdit from '@/components/UserPasswordEdit'

export default {
  components: {
    UserAccountEdit,
    UserMigrate,
    UserPasswordEdit
  },

  middleware: ['no-org', 'no-auth-redirect-login'],

  async fetch({ store }) {
    const { auth } = store.state

    await store.dispatch('users/get', auth.user._id)
  },

  computed: {
    ...mapGetters({
      getUser: 'users/get',
      isLocal: 'session/isLocal'
    }),

    ...mapState(['auth'])
  }
}
</script>

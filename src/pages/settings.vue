<template>
  <v-layout column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout>
          <v-flex>
            <h3 class="display-2 font-weight-light mb-2">User settings</h3>
          </v-flex>
        </v-layout>

        <v-layout>
          <v-flex xs12 md8>
            <user-account-edit :user="getUser(auth.user._id)" />
          </v-flex>
        </v-layout>

        <v-layout>
          <v-flex xs12 md8>
            <user-password-edit :user="getUser(auth.user._id)" />
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import UserAccountEdit from '@/components/UserAccountEdit'
import UserPasswordEdit from '@/components/UserPasswordEdit'

export default {
  components: {
    UserAccountEdit,
    UserPasswordEdit
  },

  middleware: ['no-org', 'no-auth-redirect-login'],

  computed: {
    ...mapGetters({
      getUser: 'users/get'
    }),

    ...mapState(['auth'])
  },

  async fetch({ store }) {
    const { auth } = store.state

    await store.dispatch('users/get', auth.user._id)
  }
}
</script>

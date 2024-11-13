<template>
  <v-dialog v-model="isTokenExpired" max-width="500" persistent>
    <form v-if="isLocal" @submit.prevent="submit">
      <v-card>
        <ValidationObserver ref="observer" v-slot="{ invalid }">
          <v-card-title class="headline grey lighten-4 mb-4"
            >Session expired</v-card-title
          >

          <v-card-text>
            Please verify your password to continue. You may also choose to
            <v-chip @click="logoutRedirect">log out</v-chip> and reload the
            page.
          </v-card-text>

          <v-container fluid>
            <v-row dense>
              <v-col>
                <v-text-field
                  :value="auth && auth.user && auth.user.email"
                  disabled
                  hide-details
                  label="Email"
                  solo
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <ValidationProvider
                  v-slot="{ errors }"
                  :rules="'required|min:6|max:100'"
                  name="password"
                >
                  <v-text-field
                    v-model.trim="password"
                    :disabled="loading"
                    :error-messages="errors"
                    autofocus
                    label="Password"
                    required
                    solo
                    type="password"
                  ></v-text-field>
                </ValidationProvider>
              </v-col>
            </v-row>
          </v-container>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn
              :disabled="invalid"
              :loading="loading"
              color="primary"
              text
              type="submit"
              >Verify</v-btn
            >
          </v-card-actions>
        </ValidationObserver>
      </v-card>
    </form>

    <v-card v-else>
      <v-card-title class="headline grey lighten-4 mb-4"
        >Session expired</v-card-title
      >

      <v-card-text>
        There was a problem refreshing your access token. Please log out and
        re-authenticate. If this persists, please email us at
        <a :href="`mailto:${infoEmail}?subject=Session`">{{ infoEmail }}</a
        >.
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="logoutRedirect">Log Out</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  components: {
    ValidationObserver,
    ValidationProvider
  },

  data: () => ({
    loading: false,

    password: null
  }),

  computed: {
    ...mapGetters({
      isLocal: 'session/isLocal'
    }),

    ...mapState(['auth']),
    ...mapState('session', ['isTokenExpired'])
  },

  watch: {
    auth: {
      handler(newValue) {
        if (newValue.errorOnAuthenticate) {
          if (
            newValue.errorOnAuthenticate.code === 401 ||
            newValue.errorOnAuthenticate.code === 405
          ) {
            this.$bus.$emit('status', {
              message: 'Not a valid login',
              type: 'error'
            })
          } else {
            this.$bus.$emit('status', {
              message: newValue.errorOnAuthenticate.message,
              type: 'error'
            })
          }
        }
      },
      deep: true
    },

    isTokenExpired(newValue) {
      if (newValue) {
        this.password = null

        requestAnimationFrame(() => {
          this.$refs.observer.reset()
        })
      }
    }
  },

  methods: {
    ...mapActions('auth', ['authenticate', 'logout']),
    ...mapActions('session', ['broadcastLogin']),
    ...mapMutations({
      setLocal: 'session/setLocal'
    }),

    async logoutRedirect() {
      // Native logout
      this.setLocal(true)
      await this.logout()

      window.location.assign(this.canopyLogoutURL)
    },

    submit() {
      this.loading = true

      this.setLocal(true)
      return this.authenticate({
        strategy: 'local',
        email: this.auth.user.email,
        password: this.password
      })
        .then(() => {
          this.broadcastLogin()
        })
        .catch(err => {
          this.$logger.error('submit', err)
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

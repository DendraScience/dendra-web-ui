<template>
  <v-dialog v-model="isTokenExpired" max-width="500" persistent>
    <validation-provider
      ref="passwordProvider"
      v-slot="{ errors, valid }"
      :rules="'required|min:6|max:100'"
      name="password"
      slim
    >
      <form @submit.prevent="submit">
        <v-card>
          <v-card-title class="headline grey lighten-4 mb-4"
            >Session expired</v-card-title
          >

          <v-card-text>
            Please verify your password to continue. You may also choose to
            <v-chip @click="logoutRedirect">log out</v-chip> and reload the
            page.
          </v-card-text>

          <v-container fluid grid-list-lg>
            <v-layout column>
              <v-flex>
                <v-text-field
                  :value="auth && auth.user && auth.user.email"
                  disabled
                  label="Email"
                  solo
                ></v-text-field>

                <v-text-field
                  v-model.trim="password"
                  :error-messages="errors"
                  autofocus
                  data-vv-name="password"
                  label="Password"
                  required
                  solo
                  type="password"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn :disabled="!valid" color="primary" text type="submit"
              >Verify</v-btn
            >
          </v-card-actions>
        </v-card>
      </form>
    </validation-provider>
  </v-dialog>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    ValidationProvider
  },

  data: () => ({
    password: null
  }),

  computed: {
    ...mapState(['auth']),
    ...mapState('session', ['isTokenExpired'])
  },

  watch: {
    auth: {
      handler(newValue) {
        if (newValue.errorOnAuthenticate) {
          this.$emit('status', {
            message: newValue.errorOnAuthenticate.message,
            type: 'error'
          })
        }
      },
      deep: true
    },

    isTokenExpired(newValue) {
      if (newValue) {
        this.password = null

        const provider = this.$refs.passwordProvider
        if (provider) provider.reset()
      }
    }
  },

  methods: {
    ...mapActions('auth', ['authenticate', 'logout']),

    logoutRedirect() {
      // Force Vuex reset with $router.go
      this.logout().then(() => this.$router.go())
    },

    submit() {
      return this.authenticate({
        strategy: 'local',
        email: this.auth.user.email,
        password: this.password
      }).catch(err => {
        this.$logger.error('submit', err)
      })
    }
  }
}
</script>

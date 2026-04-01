<template>
  <v-container>
    <template v-if="canopyLoginURL">
      <v-row>
        <v-col>
          <h2 class="display-1 my-2">Log in to Dendra</h2>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="6">
          <h3 class="headline mb-2">Attention</h3>

          <p class="body-1 mb-4">
            We have recently upgraded our security to allow new users to set up
            their own account and to support Single Sign-On (SSO) with providers
            such as ORCID. Click the button below to sign in using the new login
            experience.
          </p>

          <p class="body-1 mb-4 font-weight-bold">
            If you already have a Dendra account, we have migrated your account
            and you will need to reset your password to log in.
          </p>

          <v-btn color="primary" large @click="loginCanopy"
            >Log In or Sign Up
            <v-icon right>{{ mdiArrowRight }}</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-row>
        <v-col>
          <h2 class="display-2 font-weight-light my-2">Log in to Dendra</h2>
          <h3 class="subtitle-1 mb-4">
            Don’t have an account?
            <nuxt-link to="/about">Contact us</nuxt-link>
          </h3>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <ValidationObserver ref="observer">
            <form @submit.prevent="submit">
              <ValidationProvider
                v-slot="{ errors }"
                name="email"
                rules="required|email"
              >
                <v-text-field
                  v-model="email"
                  :error-messages="errors"
                  filled
                  label="Email"
                  required
                ></v-text-field>
              </ValidationProvider>

              <ValidationProvider
                v-slot="{ errors }"
                name="password"
                rules="required|min:6|max:100"
              >
                <v-text-field
                  v-model="password"
                  :append-icon="isPasswordShown ? mdiEyeOff : mdiEye"
                  :error-messages="errors"
                  :type="isPasswordShown ? 'text' : 'password'"
                  filled
                  label="Password"
                  required
                  @click:append="isPasswordShown = !isPasswordShown"
                ></v-text-field>
              </ValidationProvider>

              <v-btn :loading="loading" color="primary" type="submit"
                >Log In</v-btn
              >
            </form>
          </ValidationObserver>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { ValidationObserver, ValidationProvider } from 'vee-validate'

export default {
  components: {
    ValidationObserver,
    ValidationProvider
  },

  middleware: ['no-org', 'auth-redirect-orgs'],

  data: () => ({
    isPasswordShown: false,
    loading: false,

    email: '',
    password: ''
  }),

  computed: {
    ...mapState(['auth'])
  },

  watch: {
    auth: {
      handler(newValue) {
        if (newValue.errorOnAuthenticate) {
          this.$bus.$emit('status', {
            message: newValue.errorOnAuthenticate.message,
            type: 'error'
          })
        }
      },
      deep: true
    }
  },

  methods: {
    ...mapActions('auth', ['authenticate']),

    loginCanopy() {
      window.location.assign(this.canopyLoginURL)
    },

    async submit() {
      if (!(await this.$refs.observer.validate())) return

      this.loading = true

      return this.authenticate({
        strategy: 'local',
        email: this.email.toLowerCase(),
        password: this.password
      })
        .then(() => {
          this.$store.commit('ability/clearAll')
          this.$tracker.event('loginSuccess')
          this.$router.push({ name: 'orgs' })
        })
        .catch(err => {
          this.$logger.error('submit', err)
          this.$tracker.event('loginError', {
            message: err.message
          })
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

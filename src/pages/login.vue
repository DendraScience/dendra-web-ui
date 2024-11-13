<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light my-2">Log in to Dendra</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <h3 class="headline mb-2">For new users</h3>

        <p class="body-1 mb-4">
          Click below to log in or sign up using Single Sign-On (SSO). We
          support both
          <a href="https://orcid.org/" target="_blank">ORCID</a> and Google just
          to name a few. You may also sign up using an email and password.
        </p>

        <v-btn :disabled="loading" color="primary" large @click="loginCanopy"
          >Log In or Sign Up
          <v-icon right>{{ mdiArrowRight }}</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <v-divider />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <h3 class="headline mb-2">For users set up before November 1, 2024</h3>

        <p class="body-1 mb-4">
          If our support team set you up with a user account anytime before
          November 1, 2024, then log in below using your email and password.
          Once logged in, you can migrate your classic Dendra account to Single
          Sign-On at any time.
        </p>

        <ValidationObserver ref="observer">
          <form @submit.prevent="submit">
            <ValidationProvider
              v-slot="{ errors }"
              name="email"
              rules="required|email"
            >
              <v-text-field
                v-model="email"
                :disabled="loading"
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
                :disabled="loading"
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
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
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
    }
  },

  methods: {
    ...mapActions('auth', ['authenticate']),
    ...mapActions('session', ['broadcastLogin']),
    ...mapMutations({
      clearAll: 'ability/clearAll',
      setLocal: 'session/setLocal'
    }),

    loginCanopy() {
      window.location.assign(this.canopyLoginURL)
    },

    async submit() {
      if (!(await this.$refs.observer.validate())) return

      this.loading = true

      this.setLocal(true)
      return this.authenticate({
        strategy: 'local',
        email: this.email.toLowerCase(),
        password: this.password
      })
        .then(() => {
          this.clearAll()
          this.broadcastLogin()
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

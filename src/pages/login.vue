<template>
  <v-layout column>
    <v-flex px-1>
      <v-alert
        :value="auth.errorOnAuthenticate"
        type="error"
        dismissible
        transition="slide-y-transition"
      >
        {{ auth.errorOnAuthenticate && auth.errorOnAuthenticate.message }}
      </v-alert>
    </v-flex>

    <v-flex>
      <v-container grid-list-lg>
        <v-layout row>
          <v-flex xs12>
            <h3 class="display-2 mb-2">Log in to Dendra</h3>
            <span class="body-2"
              >Don’t have an account?
              <nuxt-link to="/contact">Contact us</nuxt-link></span
            >
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex xs12 sm6>
            <form @submit.prevent="submit">
              <v-text-field
                v-model="email"
                v-validate="'required|email'"
                :error-messages="errors.collect('email')"
                box
                browser-autocomplete="username"
                data-vv-name="email"
                label="Email"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                v-validate="'required|min:6|max:100'"
                :append-icon="isPasswordShown ? 'visibility_off' : 'visibility'"
                :error-messages="errors.collect('password')"
                :type="isPasswordShown ? 'text' : 'password'"
                box
                browser-autocomplete="current-password"
                data-vv-name="password"
                label="Password"
                required
                @click:append="isPasswordShown = !isPasswordShown"
              ></v-text-field>

              <v-btn color="primary" type="submit">Log in</v-btn>
            </form>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  middleware: ['no-org', 'no-auth-redirect-orgs'],

  data: () => ({
    isPasswordShown: false,

    email: '',
    password: ''
  }),

  computed: {
    ...mapState(['auth'])
  },

  methods: {
    ...mapActions('auth', ['authenticate']),

    async submit() {
      if (!(await this.$validator.validateAll())) return

      return this.authenticate({
        strategy: 'local',
        email: this.email.toLowerCase(),
        password: this.password
      })
        .then(() => {
          this.$store.commit('ability/clearAll')
          this.$router.push({ name: 'orgs' })
        })
        .catch(err => {
          this.$logger.error('submit', err)
        })
    }
  }
}
</script>

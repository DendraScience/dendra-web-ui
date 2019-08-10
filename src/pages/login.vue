<template>
  <v-layout column>
    <v-flex>
      <v-container grid-list-lg>
        <v-layout>
          <v-flex xs12>
            <h3 class="display-2 font-weight-light mb-2">Log in to Dendra</h3>
            <span class="body-2"
              >Don’t have an account?
              <nuxt-link to="/contact">Contact us</nuxt-link></span
            >
          </v-flex>
        </v-layout>

        <v-layout wrap>
          <v-flex xs12 sm6>
            <form @submit.prevent="submit">
              <v-text-field
                v-model="email"
                v-validate="'required|email'"
                :error-messages="errors.collect('email')"
                data-vv-name="email"
                filled
                label="Email"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                v-validate="'required|min:6|max:100'"
                :append-icon="isPasswordShown ? 'visibility_off' : 'visibility'"
                :error-messages="errors.collect('password')"
                :type="isPasswordShown ? 'text' : 'password'"
                data-vv-name="password"
                filled
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

  middleware: ['no-org', 'auth-redirect-orgs'],

  data: () => ({
    isPasswordShown: false,

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

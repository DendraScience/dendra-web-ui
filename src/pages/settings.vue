<template>
  <v-layout column>
    <v-flex px-1>
      <v-alert
        :value="status"
        type="info"
        dismissible
        transition="slide-y-transition"
      >
        {{ status }}
      </v-alert>
    </v-flex>

    <v-flex>
      <v-container grid-list-lg>
        <v-layout row wrap>
          <v-flex xs12>
            <h3 class="display-2 mb-2">User settings</h3>
          </v-flex>

          <v-flex xs12 sm6>
            <v-card>
              <form @submit.prevent="submit">
                <v-card-text>
                  <h5 class="headline">Account</h5>

                  <v-text-field
                    v-model="name"
                    v-validate="'required'"
                    :error-messages="errors.collect('name')"
                    label="Name"
                    data-vv-name="name"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="email"
                    v-validate="'required|email'"
                    :error-messages="errors.collect('email')"
                    label="Email"
                    data-vv-name="email"
                    required
                  ></v-text-field>
                </v-card-text>

                <v-card-actions>
                  <v-btn color="primary" type="submit">Save</v-btn>
                </v-card-actions>
              </form>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  // middleware: ['no-auth-redirect-login'],

  data: () => ({
    currentPassword: '',
    email: '',
    name: '',
    status: null
  }),

  computed: {
    ...mapState(['auth'])
  },

  async fetch({ store }) {
    const { auth } = store.state

    await store.dispatch('users/get', auth.user._id)
  },

  methods: {
    // ...mapActions('auth', ['authenticate']),

    async submit() {
      // if (!(await this.$validator.validateAll())) return
      // return this.authenticate({
      //   strategy: 'local',
      //   email: this.email.toLowerCase(),
      //   password: this.password
      // })
      //   .then(() => {
      //     this.$store.commit('ability/clearAll')
      //     this.$router.push({ name: 'index' })
      //   })
      //   .catch(err => {
      //     this.$logger.error('submit', err)
      //   })
    }
  }
}
</script>

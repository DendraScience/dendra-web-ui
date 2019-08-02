<template>
  <v-card>
    <form @submit.prevent="submit">
      <v-card-title class="headline">
        Account
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="name"
          v-validate="'required|max:100'"
          :error-messages="errors.collect('name')"
          data-vv-name="name"
          label="Name"
          required
        ></v-text-field>

        <v-text-field
          v-model="email"
          v-validate="'required|email'"
          :error-messages="errors.collect('email')"
          data-vv-name="email"
          label="Email"
          required
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn
          :disabled="isPatchPending"
          :loading="isPatchPending"
          color="primary"
          type="submit"
          >Update account</v-btn
        >
      </v-card-actions>
    </form>
  </v-card>
</template>

<script>
import _pick from 'lodash/pick'

import { mapActions, mapState } from 'vuex'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  props: {
    user: { default: null, type: Object }
  },

  data() {
    const { user } = this

    return {
      id: user._id,
      email: user.email,
      name: user.name
    }
  },

  computed: {
    ...mapState('users', ['isPatchPending'])
  },

  methods: {
    ...mapActions({
      patch: 'users/patch'
    }),

    async submit() {
      if (!(await this.$validator.validateAll())) return

      const $set = _pick(this, ['email', 'name'])

      return this.patch([this.id, { $set }, {}])
        .then(() =>
          this.$bus.$emit('status', {
            type: 'success',
            message: 'Account updated.' // TODO: Localize
          })
        )
        .catch(({ message }) =>
          this.$bus.$emit('status', { type: 'error', message })
        )
    }
  }
}
</script>

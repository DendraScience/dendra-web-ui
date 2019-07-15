<template>
  <v-card>
    <form @submit.prevent="submit">
      <v-card-title primary-title class="headline">
        Change password
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="current_password"
          v-validate="'required|min:6|max:100'"
          :error-messages="errors.collect('current_password')"
          browser-autocomplete="off"
          label="Current password"
          type="password"
          data-vv-name="current_password"
          required
        ></v-text-field>

        <v-text-field
          ref="new_password"
          v-model="password"
          v-validate="'required|min:6|max:100'"
          :error-messages="errors.collect('new_password')"
          browser-autocomplete="off"
          data-vv-delay="300"
          data-vv-name="new_password"
          label="New password"
          required
          type="password"
        ></v-text-field>

        <v-text-field
          v-model="password_confirm"
          v-validate="'required|confirmed:new_password'"
          :error-messages="errors.collect('new_password_confirm')"
          browser-autocomplete="off"
          data-vv-delay="300"
          data-vv-name="new_password_confirm"
          label="New password confirmation"
          required
          type="password"
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn
          :disabled="isPatchPending"
          :loading="isPatchPending"
          color="primary"
          type="submit"
          >Change password</v-btn
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
      current_password: '',
      password: '',
      password_confirm: ''
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

      const $set = _pick(this, ['current_password', 'password'])

      return this.patch([this.id, { $set }, {}])
        .then(() =>
          this.$bus.$emit('status', {
            type: 'success',
            message: 'Password changed.' // TODO: Localize
          })
        )
        .catch(({ message }) =>
          this.$bus.$emit('status', { type: 'error', message })
        )
    }
  }
}
</script>

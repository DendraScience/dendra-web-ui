<template>
  <v-card>
    <ValidationObserver ref="observer">
      <form @submit.prevent="submit">
        <v-card-title class="headline">
          Change password
        </v-card-title>

        <v-card-text>
          <ValidationProvider
            v-slot="{ errors }"
            name="current password"
            rules="required|min:6|max:100"
          >
            <v-text-field
              v-model="current_password"
              :error-messages="errors"
              label="Current password"
              required
              type="password"
            ></v-text-field>
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ errors }"
            name="new password"
            rules="required|min:6|max:100"
            vid="new_password"
          >
            <v-text-field
              v-model="password"
              :error-messages="errors"
              label="New password"
              required
              type="password"
            ></v-text-field>
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ errors }"
            name="confirmation"
            rules="required|confirmed:new_password"
          >
            <v-text-field
              v-model="password_confirm"
              :error-messages="errors"
              label="New password confirmation"
              required
              type="password"
            ></v-text-field>
          </ValidationProvider>
        </v-card-text>

        <v-card-actions>
          <v-btn
            :disabled="isPatchPending"
            :loading="isPatchPending"
            color="primary"
            type="submit"
            >Change Password</v-btn
          >
        </v-card-actions>
      </form>
    </ValidationObserver>
  </v-card>
</template>

<script>
import _pick from 'lodash/pick'
import { mapActions, mapState } from 'vuex'
import { ValidationObserver, ValidationProvider } from 'vee-validate'

export default {
  components: {
    ValidationObserver,
    ValidationProvider
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
      if (!(await this.$refs.observer.validate())) return

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

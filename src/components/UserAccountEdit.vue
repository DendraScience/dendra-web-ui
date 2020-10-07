<template>
  <v-card>
    <ValidationObserver ref="observer">
      <form @submit.prevent="submit">
        <v-card-title class="headline"> Account </v-card-title>

        <v-card-text>
          <ValidationProvider
            v-slot="{ errors }"
            name="name"
            rules="required|max:100"
          >
            <v-text-field
              v-model="name"
              :error-messages="errors"
              label="Name"
              required
            ></v-text-field>
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ errors }"
            name="email"
            rules="required|email"
          >
            <v-text-field
              v-model="email"
              :error-messages="errors"
              label="Email"
              required
            ></v-text-field>
          </ValidationProvider>
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
      if (!(await this.$refs.observer.validate())) return

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

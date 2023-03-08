<template>
  <v-row>
    <v-col>
      <v-row>
        <v-col>
          <v-card>
            <v-container fluid>
              <v-row>
                <v-col>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="email"
                    rules="required|email"
                  >
                    <v-text-field
                      v-model.trim="value.email"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Email"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="full_name"
                    rules="required|min:1|max:100"
                  >
                    <v-text-field
                      v-model.trim="value.full_name"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Full Name"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-if="create"
                    v-slot="{ errors }"
                    name="password"
                    rules="required|min:1|max:100"
                  >
                    <v-text-field
                      v-model.trim="value.password"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Password"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="preferred name"
                    rules="required|min:1|max:100"
                  >
                    <v-text-field
                      v-model.trim="value.name"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Preferred Name"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="roles"
                    rules="required"
                  >
                    <v-select
                      v-model="value.roles"
                      :items="['user', 'manager']"
                      :error-messages="errors"
                      chips
                      deletable-chips
                      dense
                      label="Roles"
                      hide-details
                      small-chips
                      variant="solo"
                      :readonly="!editing"
                    ></v-select>
                  </ValidationProvider>
                </v-col>
              </v-row>

              <standard-audit v-if="!editing" :value="value" />
              <standard-identifier v-if="!editing" :value="value" />

              <v-card-actions v-if="!editing && $canRemove('user')">
                <v-btn color="red" dark @click="isRemoveOpen = true"
                  ><v-icon left>{{ mdiDelete }}</v-icon
                  >Remove user</v-btn
                >
              </v-card-actions>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <v-dialog v-model="isRemoveOpen" dark max-width="500" persistent>
      <v-card>
        <v-card-title class="headline"> Remove User </v-card-title>

        <v-card-text>
          Are you Sure to delete &#x22;{{ value.full_name }}&#x22;
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="isRemoveOpen = false">cancel</v-btn>
          <v-btn @click="removeUser(true)">Continue</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapActions } from 'vuex'
import { ValidationProvider } from 'vee-validate'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'

export default {
  components: {
    ValidationProvider,
    StandardAudit,
    StandardIdentifier
  },

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true },
    create: { default: false, type: Boolean }
  },

  data() {
    return {
      isRemoveOpen: false
    }
  },

  methods: {
    ...mapActions({ remove: 'users/remove' }),

    async removeUser() {
      try {
        await this.remove([this.value._id, {}])
        this.$router.push(
          {
            name: 'users'
          },
          () => {
            this.$bus.$emit('edit-status', {
              type: 'success',
              message: 'User deleted.' // TODO: Localize
            })
          }
        )
      } catch (err) {
        this.$bus.$emit('edit-status', { type: 'error', message: err.message })
      }
    }
  }
}
</script>

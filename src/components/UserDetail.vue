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
                    name="preferred name"
                    rules="required|min:1|max:100"
                  >
                    <v-text-field
                      v-model.trim="value.name"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Preferred name"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider v-slot="{ errors }" name="full_name">
                    <v-text-field
                      v-model.trim="value.full_name"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Full name"
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-if="create"
                    v-slot="{ errors }"
                    name="password"
                    rules="required|min:10|max:100"
                    vid="password"
                  >
                    <v-text-field
                      v-model.trim="value.password"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Password"
                      required
                      type="password"
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-if="create"
                    v-slot="{ errors }"
                    name="confirmation"
                    rules="required|confirmed:password"
                  >
                    <v-text-field
                      v-model="value.password_confirm"
                      :error-messages="errors"
                      label="Password confirmation"
                      required
                      type="password"
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="roles"
                    rules="required"
                  >
                    <v-select
                      v-model="value.roles"
                      class="pt-3"
                      :items="roles"
                      :error-messages="errors"
                      chips
                      deletable-chips
                      dense
                      label="Role"
                      hide-details
                      small-chips
                      variant="solo"
                      :readonly="!editing"
                    ></v-select>
                  </ValidationProvider>
                </v-col>
              </v-row>

              <standard-options :editing="editing" :value="value" as="users" />

              <standard-audit v-if="!editing" :value="value" />

              <standard-identifier v-if="!editing" :value="value" />
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'

export default {
  components: {
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    ValidationProvider
  },

  props: {
    create: { default: false, type: Boolean },
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  computed: {
    roles() {
      const roles = ['user', 'manager']
      if (
        this.$cannotPatch('users', {
          _id: this.value._id
        })
      ) {
        return roles.filter(role => role === this.value.roles)
      }

      return roles
    }
  }
}
</script>

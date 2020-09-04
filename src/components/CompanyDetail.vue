<template>
  <v-container fluid pa-0>
    <v-row>
      <v-col>
        <v-card>
          <v-container fluid pt-0>
            <v-row>
              <v-col>
                <ValidationProvider
                  v-slot="{ errors }"
                  name="name"
                  rules="required|min:5|max:100"
                >
                  <v-text-field
                    v-model.trim="value.name"
                    :error-messages="errors"
                    :readonly="!editing"
                    label="Name"
                    required
                  ></v-text-field>
                </ValidationProvider>

                <ValidationProvider
                  v-slot="{ errors }"
                  name="full name"
                  rules="min:5|max:100"
                >
                  <v-text-field
                    v-model.trim="value.full_name"
                    :error-messages="errors"
                    :readonly="!editing"
                    label="Full name"
                  ></v-text-field>
                </ValidationProvider>

                <v-select
                  v-model="value.company_type"
                  :items="companyTypeItems"
                  :readonly="!editing"
                  label="Company type"
                ></v-select>

                <ValidationProvider
                  v-slot="{ errors }"
                  name="url"
                  :rules="{
                    url: {
                      protocols: ['http', 'https'],
                      require_protocol: true
                    }
                  }"
                >
                  <v-text-field
                    v-model.trim="value.url"
                    :error-messages="errors"
                    :readonly="!editing"
                    label="URL"
                  ></v-text-field>
                </ValidationProvider>

                <ValidationProvider
                  v-slot="{ errors }"
                  name="description"
                  rules="min:5|max:5000"
                >
                  <v-textarea
                    v-model.trim="value.description"
                    :error-messages="errors"
                    :readonly="!editing"
                    auto-grow
                    label="Description"
                  ></v-textarea>
                </ValidationProvider>
              </v-col>
            </v-row>

            <standard-options
              :editing="editing"
              :value="value"
              as="companies"
            />
            <standard-audit v-if="!editing" :value="value" />
            <standard-identifier :value="value" />
          </v-container>

          <v-card-actions v-if="!editing">
            <v-btn v-if="value.url" :href="value.url" dark target="_blank"
              ><v-icon left>{{ mdiOpenInApp }}</v-icon>
              Visit Website
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!editing">
      <v-col cols="12" md="6">
        <thing-type-total
          :company="value"
          :is-enabled="true"
          hide-actions
          total-label="enabled"
        />
      </v-col>

      <v-col v-if="$canCreate('thing-types', {})" cols="12" md="6">
        <thing-type-total
          :company="value"
          :is-enabled="false"
          hide-actions
          total-label="disabled"
        />
      </v-col>
    </v-row>

    <!-- TODO: Implement editing later! -->
    <v-row v-if="!editing">
      <v-col>
        <detail-external-refs :editing="editing" :value="value" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import ThingTypeTotal from '@/components/ThingTypeTotal'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'

export default {
  components: {
    ThingTypeTotal,
    DetailExternalRefs,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    ValidationProvider
  },

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data() {
    return {
      companyTypeItems: ['academic', 'corporation']
    }
  }
}
</script>

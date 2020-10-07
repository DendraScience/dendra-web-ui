<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <ValidationProvider name="type" rules="required">
          <v-select
            v-model="value.type"
            :items="typeItems[value.target]"
            :prepend-inner-icon="mdiAsterisk"
            hide-details
            label="Type"
            required
            solo
          ></v-select>
        </ValidationProvider>
      </v-col>
    </v-row>

    <v-row v-if="value.type">
      <v-col>
        <v-card outlined>
          <v-container fluid>
            <v-row dense>
              <v-col>
                <ValidationProvider
                  v-slot="{ errors }"
                  name="key"
                  :rules="{
                    regex: /^[A-Za-z][A-Za-z0-9_]*$/,
                    required: true,
                    min: 1,
                    max: 100
                  }"
                >
                  <v-text-field
                    v-model.trim="value.key"
                    :disabled="keyDisabled"
                    :error-messages="errors"
                    autofocus
                    label="Key"
                    required
                  ></v-text-field>
                </ValidationProvider>
              </v-col>
            </v-row>

            <v-row v-if="value.type === 'boolean'" dense>
              <v-col>
                <ValidationProvider name="value" rules="required">
                  <v-select
                    v-model="value.booleanValue"
                    :items="booleanItems"
                    item-text="text"
                    item-value="value"
                    label="Value"
                  ></v-select>
                </ValidationProvider>
              </v-col>
            </v-row>

            <v-row v-else-if="value.type" dense>
              <v-col>
                <ValidationProvider
                  v-slot="{ errors }"
                  name="value"
                  :rules="
                    value.target === 'object' || value.type === 'number'
                      ? {
                          between: { min: -100000000, max: 100000000 },
                          required: true
                        }
                      : { required: true }
                  "
                >
                  <v-text-field
                    v-model.trim="value.textValue"
                    :error-messages="errors"
                    label="Value"
                    required
                  ></v-text-field>
                </ValidationProvider>
              </v-col>

              <v-col v-if="value.type === 'delta' || value.type === 'range'">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="value"
                  :rules="{
                    between: { min: -100000000, max: 100000000 },
                    required: true
                  }"
                >
                  <v-text-field
                    v-model.trim="value.textValue2"
                    :error-messages="errors"
                    label="Value"
                    required
                  ></v-text-field>
                </ValidationProvider>
              </v-col>
            </v-row>

            <v-row v-if="value.type && value.target === 'object'" dense>
              <feathers-vuex-get
                :id="'dt-unit'"
                v-slot="{ item }"
                service="vocabularies"
              >
                <v-col v-if="item">
                  <v-autocomplete
                    v-model="value.unitTag"
                    :items="item.terms"
                    :item-text="term => term.name || term.label"
                    :item-value="
                      term => `${item.scheme_id}_${item.label}_${term.label}`
                    "
                    clearable
                    label="Unit"
                  ></v-autocomplete>
                </v-col>
              </feathers-vuex-get>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ValidationProvider } from 'vee-validate'

export default {
  components: {
    ValidationProvider
  },

  props: {
    keyDisabled: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    booleanItems: [
      {
        text: 'false',
        value: false
      },
      {
        text: 'true',
        value: true
      }
    ],
    typeItems: {
      object: ['delta', 'range', 'value'],
      value: ['boolean', 'number', 'string']
    }
  })
}
</script>

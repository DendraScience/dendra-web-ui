<template>
  <v-container fluid grid-list-xs>
    <v-layout column>
      <v-flex>
        <v-select
          v-model="value.type"
          :items="typeItems[value.target]"
          label="Type"
          prepend-inner-icon="mdi-asterisk"
          required
          solo
        ></v-select>

        <ValidationProvider
          v-if="value.type"
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
      </v-flex>
    </v-layout>

    <v-layout v-if="value.type === 'boolean'" column>
      <ValidationProvider name="value" rules="required">
        <v-select
          v-model="value.booleanValue"
          :items="booleanItems"
          item-text="text"
          item-value="value"
          label="Value"
        ></v-select>
      </ValidationProvider>
    </v-layout>

    <v-layout v-else-if="value.type" row>
      <v-flex>
        <ValidationProvider
          v-slot="{ errors }"
          name="value"
          :rules="
            value.target === 'object' || value.type === 'number'
              ? { between: [-100000000, 100000000], required: true }
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
      </v-flex>

      <v-flex v-if="value.type === 'delta' || value.type === 'range'">
        <ValidationProvider
          v-slot="{ errors }"
          name="value"
          :rules="{ between: [-100000000, 100000000], required: true }"
        >
          <v-text-field
            v-model.trim="value.textValue2"
            :error-messages="errors"
            label="Value"
            required
          ></v-text-field>
        </ValidationProvider>
      </v-flex>
    </v-layout>

    <v-layout v-if="value.type && value.target === 'object'" column>
      <v-flex>
        <feathers-vuex-get
          :id="'dt-unit'"
          v-slot="{ item }"
          service="vocabularies"
        >
          <v-autocomplete
            v-if="item"
            v-model="value.unitTag"
            :items="item.terms"
            :item-text="term => term.name || term.label"
            :item-value="
              term => `${item.scheme_id}_${item.label}_${term.label}`
            "
            clearable
            label="Unit"
          ></v-autocomplete>
        </feathers-vuex-get>
      </v-flex>
    </v-layout>
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

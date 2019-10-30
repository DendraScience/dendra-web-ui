<template>
  <v-container fluid>
    <v-layout column>
      <v-flex>
        <v-select
          v-model="value.type"
          :items="typeItems"
          :prepend-inner-icon="icons[value.type]"
          item-text="text"
          item-value="value"
          solo
        ></v-select>
      </v-flex>

      <v-flex>
        <attribute-fields
          v-if="value.type === 'single'"
          v-model="value.single"
          class="pa-0"
        />
        <attribute-fields
          v-else-if="value.type === 'struct'"
          v-model="value.struct"
          class="pa-0"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import AttributeFields from '@/components/AttributeFields'

export default {
  components: {
    AttributeFields
  },

  props: {
    value: { type: Object, required: true }
  },

  data: () => ({
    icons: {
      single: 'mdi-dice-1',
      struct: 'mdi-dice-2'
    },
    typeItems: [
      {
        text: 'Single value',
        value: 'single'
      },
      {
        text: 'Structured value',
        value: 'struct'
      }
    ]
  })
}
</script>

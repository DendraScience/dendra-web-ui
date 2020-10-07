<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <v-select
          v-model="value.type"
          :items="typeItems"
          :prepend-inner-icon="icons[value.type]"
          hide-details
          item-text="text"
          item-value="value"
          solo
        ></v-select>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import AttributeFields from '@/components/AttributeFields'
import { mdiDice1, mdiDice2 } from '@mdi/js'

export default {
  components: {
    AttributeFields
  },

  props: {
    value: { type: Object, required: true }
  },

  data: () => ({
    icons: {
      single: mdiDice1,
      struct: mdiDice2
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

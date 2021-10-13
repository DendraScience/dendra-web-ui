<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col>
          <v-radio-group v-model="value.index" dense>
            <v-radio
              v-for="item in items"
              :key="item.value"
              :color="item.color"
              :value="item.value"
            >
              <template #label>
                <span :style="{ color: item.color }">{{ item.text }}</span>
              </template>
            </v-radio>
          </v-radio-group>
        </v-col>

        <v-col>
          <ValidationObserver ref="observer" v-slot="{ invalid }">
            <ValidationProvider
              v-slot="{ errors }"
              name="max"
              rules="between:@min,100000000"
            >
              <v-text-field
                v-model.number="value.max"
                :error-messages="errors"
                :disabled="!isSelected"
                dense
                label="max"
                outlined
                type="number"
              ></v-text-field>
            </ValidationProvider>

            <ValidationProvider
              v-slot="{ errors }"
              name="min"
              rules="between:-100000000,@max"
            >
              <v-text-field
                v-model.number="value.min"
                :error-messages="errors"
                :disabled="!isSelected"
                dense
                label="min"
                outlined
                type="number"
              ></v-text-field>
            </ValidationProvider>

            <v-btn
              :disabled="!isSelected || invalid"
              block
              outlined
              small
              @click="$emit('commit', value)"
              >Apply</v-btn
            >
          </ValidationObserver>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { ValidationObserver, ValidationProvider } from 'vee-validate'

export default {
  components: {
    ValidationObserver,
    ValidationProvider
  },

  props: {
    chartOptions: {
      default: () => {},
      type: Object
    },
    value: { type: Object, required: true }
  },

  data: () => ({ max: null, min: null }),

  computed: {
    isSelected() {
      return typeof this.value.index === 'number'
    },

    items() {
      const items = this.chartOptions.yAxis.map(
        ({ labels, opposite }, value) => ({
          color: labels.style.color,
          opposite,
          text: labels.format.replace(/\{\S+\}/g, opposite ? 'Y2' : 'Y1'),
          value
        })
      )

      return [
        ...items.filter(({ opposite }) => !opposite).reverse(),
        ...items.filter(({ opposite }) => opposite)
      ]
    }
  }
}
</script>

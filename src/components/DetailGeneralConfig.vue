<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline">
          <slot v-if="editing">General configuration overrides</slot>
          <slot v-else>General configuration</slot>
        </v-col>
      </v-row>

      <v-row v-if="!editing" dense>
        <v-col>
          <v-tabs v-model="tabIndex">
            <v-tab>Resolved</v-tab>
            <v-tab>Overrides</v-tab>
          </v-tabs>
          <v-divider />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <pre-block :value="item.settings" />
        </v-col>
      </v-row>
    </v-container>

    <v-card-actions v-if="editing">
      <v-btn v-if="value.general_config" color="primary" @click="edit(item)">
        <v-icon>{{ mdiPencil }}</v-icon>
      </v-btn>

      <v-btn v-if="value.general_config" color="primary" @click="remove">
        <v-icon>{{ mdiMinus }}</v-icon>
      </v-btn>

      <v-btn v-else color="primary" @click="add">
        <v-icon>{{ mdiPlus }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import itemEditing from '@/mixins/item-editing'
import PreBlock from '@/components/PreBlock'
import { jsonFormat } from '@/lib/utils'

export default {
  components: {
    PreBlock
  },

  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    tabIndex: 0
  }),

  computed: {
    generalConfig() {
      return this.editing || this.tabIndex === 1
        ? this.value.general_config || {}
        : this.value.general_config_resolved || {}
    },

    item() {
      return {
        settings: jsonFormat(this.generalConfig)
      }
    }
  }
}
</script>

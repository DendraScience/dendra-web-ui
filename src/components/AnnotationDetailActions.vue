<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline">
          <slot>Actions</slot>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col>
          <v-data-table
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="items"
            disable-pagination
            disable-sort
            hide-default-footer
            item-key="key"
          >
            <template #item.type="{ item }" class="text-no-wrap px-0">
              <v-icon>{{ item.icon }}</v-icon>
            </template>

            <template #item.value="{ item }">
              <v-chip
                v-for="val in item.values"
                :key="val"
                class="mr-1 my-1"
                label
                >{{ val }}</v-chip
              >
              <pre-block :value="item.code" />
            </template>

            <template #item.icons="{ item }" class="text-no-wrap">
              <v-icon
                v-if="editing && !item.custom"
                color="tertiary"
                @click="remove(item)"
                >{{ mdiMinusCircle }}</v-icon
              >
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <v-card-actions v-if="editing">
      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn color="primary" v-on="on">
            <v-icon>{{ mdiPlus }}</v-icon>
          </v-btn>
        </template>

        <v-list two-line subheader>
          <v-list-item
            v-for="(item, index) in addItems"
            :key="index"
            @click="add(item)"
          >
            <v-list-item-avatar>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.subtitle }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<script>
import {
  mdiCalculator,
  mdiCancel,
  mdiCodeTags,
  mdiDiceMultiple,
  mdiFlag
} from '@mdi/js'
import PreBlock from '@/components/PreBlock'
import itemEditing from '@/mixins/item-editing'
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
    addItems: [
      {
        icon: mdiDiceMultiple,
        subtitle: 'Datastreams will be attributed with a value.',
        target: 'attrib',
        title: 'Attrib'
      },
      {
        icon: mdiCalculator,
        subtitle: 'Datapoints will be evaluated with an expression.',
        target: 'evaluate',
        title: 'Evaluate'
      },
      {
        icon: mdiCancel,
        subtitle: 'Datapoints will be excluded from downloads and graphs.',
        target: 'exclude',
        title: 'Exclude'
      },
      {
        icon: mdiFlag,
        subtitle: 'Datapoints will marked with a textual flag.',
        target: 'flag',
        title: 'Flag'
      }
    ],

    headers: [
      {
        align: 'center',
        value: 'type',
        width: '50px'
      },
      {
        align: 'left',
        text: 'Description',
        value: 'description',
        width: '20%'
      },
      {
        align: 'left',
        text: 'Value',
        value: 'value',
        width: '40%'
      },
      {
        align: 'right',
        value: 'icons'
      }
    ]
  }),

  computed: {
    actions() {
      return this.value.actions
    },

    items() {
      return this.actions.map((item, key) => {
        if (item.attrib !== undefined) {
          return {
            code: jsonFormat(item.attrib),
            description: 'Attrib datastreams',
            icon: mdiDiceMultiple,
            key
          }
        }

        if (item.evaluate !== undefined) {
          return {
            code: item.evaluate,
            description: 'Evaluate datapoints',
            icon: mdiCalculator,
            key
          }
        }

        if (item.exclude !== undefined) {
          return {
            description: 'Exclude datapoints',
            icon: mdiCancel,
            key
          }
        }

        if (item.flag !== undefined) {
          return {
            description: 'Flag datapoints',
            icon: mdiFlag,
            key,
            values: item.flag
          }
        }

        return {
          code: jsonFormat(item),
          custom: true,
          description: 'Custom action',
          icon: mdiCodeTags,
          key
        }
      })
    }
  }
}
</script>

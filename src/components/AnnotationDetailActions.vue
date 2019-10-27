<template>
  <v-card>
    <v-card-title class="headline">
      <slot>Actions</slot>
    </v-card-title>

    <v-container fluid pt-0>
      <v-layout>
        <v-flex>
          <v-data-table
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="items"
            disable-pagination
            disable-sort
            hide-default-footer
            item-key="key"
          >
            <template v-slot:item.type="{ item }" class="text-no-wrap px-0">
              <v-icon>{{ item.icon }}</v-icon>
            </template>

            <template v-slot:item.value="{ item }">
              <v-chip
                v-for="val in item.values"
                :key="val"
                class="mr-1 my-1"
                label
                >{{ val }}</v-chip
              >
              <pre-block :value="item.code" />
            </template>

            <template v-slot:item.icons="{ item }" class="text-no-wrap">
              <v-icon
                v-if="editing && !item.custom"
                color="tertiary"
                @click="remove(item)"
                >mdi-minus-circle</v-icon
              >
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>

    <v-card-actions v-if="editing">
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" v-on="on">
            <v-icon>add</v-icon>
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
        icon: 'mdi-dice-multiple',
        subtitle: 'Datastreams will be attributed with a value.',
        target: 'attrib',
        title: 'Attrib'
      },
      {
        icon: 'mdi-calculator',
        subtitle: 'Datapoints will be evaluated with an expression.',
        target: 'evaluate',
        title: 'Evaluate'
      },
      {
        icon: 'mdi-cancel',
        subtitle: 'Datapoints will be excluded from downloads and graphs.',
        target: 'exclude',
        title: 'Exclude'
      },
      {
        icon: 'mdi-flag',
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
            icon: 'mdi-dice-multiple',
            key
          }
        }

        if (item.evaluate !== undefined) {
          return {
            code: item.evaluate,
            description: 'Evaluate datapoints',
            icon: 'mdi-calculator',
            key
          }
        }

        if (item.exclude !== undefined) {
          return {
            description: 'Exclude datapoints',
            icon: 'mdi-cancel',
            key
          }
        }

        if (item.flag !== undefined) {
          return {
            description: 'Flag datapoints',
            icon: 'mdi-flag',
            key,
            values: item.flag
          }
        }

        return {
          code: jsonFormat(item),
          custom: true,
          description: 'Custom action',
          icon: 'mdi-code-tags',
          key
        }
      })
    }
  }
}
</script>

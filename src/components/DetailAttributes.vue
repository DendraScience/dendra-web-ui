<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline">
          <slot>Attributes</slot>
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
              <pre-block :value="item.value" />
            </template>

            <template #item.icons="{ item }" class="text-no-wrap">
              <span v-if="editing" class="text-no-wrap">
                <v-icon color="tertiary" class="mr-2" @click="edit(item)">{{
                  mdiPencil
                }}</v-icon>
                <v-icon color="tertiary" @click="remove(item)">{{
                  mdiMinusCircle
                }}</v-icon>
              </span>
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
import _sortBy from 'lodash/sortBy'
import { mdiDice1, mdiDice2 } from '@mdi/js'
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
        icon: mdiDice1,
        subtitle: 'Specify a typed value without unit.',
        target: 'value',
        title: 'Single value'
      },
      {
        icon: mdiDice2,
        subtitle: 'Specify a delta, range or value with unit.',
        target: 'object',
        title: 'Structured value'
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
        text: 'Key',
        value: 'key',
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
    attributes() {
      return this.value.attributes || {}
    },

    items() {
      const { attributes } = this

      return _sortBy(
        Object.keys(attributes).map(key => {
          const item = attributes[key]

          if (typeof item === 'object') {
            return {
              icon: mdiDice2,
              key,
              target: 'object',
              value: jsonFormat(item)
            }
          }

          return {
            icon: mdiDice1,
            key,
            target: 'value',
            value: jsonFormat(item)
          }
        }),
        ['key']
      )
    }
  }
}
</script>

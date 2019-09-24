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

            <template v-slot:item.description="{ item }" class="py-4">
              <span v-if="item.label" class="mr-1">{{ item.label }}</span>
              <v-chip
                v-for="val in item.values"
                :key="val"
                class="mr-1 my-1"
                label
                >{{ val }}</v-chip
              >
              <pre v-if="item.custom">{{ item.custom }}</pre>
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
import itemEditing from '@/mixins/item-editing'

export default {
  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    addItems: [
      {
        icon: 'block',
        subtitle: 'Datapoints will be excluded from downloads and graphs.',
        target: 'exclude',
        title: 'Exclude'
      },
      {
        icon: 'flag',
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
        width: '60%'
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
        if (item.exclude !== undefined) {
          return {
            icon: 'block',
            key,
            label: 'Exclude datapoints'
          }
        }

        if (item.flag !== undefined) {
          return {
            icon: 'flag',
            key,
            label: 'Flag datapoints',
            values: item.flag
          }
        }

        return {
          custom: JSON.stringify(item),
          icon: 'code',
          key
        }
      })
    }
  }
}
</script>

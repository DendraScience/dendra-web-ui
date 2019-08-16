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
            :items="items"
            :mobile-breakpoint="0"
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
              <pre v-if="item.custom"><code>{{ item.custom }}</code></pre>
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
export default {
  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    addItems: [
      {
        icon: 'block',
        target: 'exclude',
        title: 'Exclude',
        subtitle: 'Datapoints will be excluded from downloads and graphs.'
      },
      {
        icon: 'flag',
        target: 'flag',
        title: 'Flag',
        subtitle: 'Datapoints will marked with a textual flag.'
      }
    ],

    headers: [
      {
        align: 'center',
        sortable: false,
        value: 'type',
        width: '10%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Description',
        value: 'description',
        width: '60%'
      },
      {
        align: 'right',
        sortable: false,
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
            label: 'Exclude datapoints',
            icon: 'block',
            key
          }
        }

        if (item.flag !== undefined) {
          return {
            label: 'Flag datapoints',
            values: item.flag,
            icon: 'flag',
            key
          }
        }

        return {
          custom: JSON.stringify(item),
          icon: 'code',
          key
        }
      })
    }
  },

  methods: {
    add(item) {
      this.$emit('add', item)
    },

    remove(item) {
      this.$emit('remove', item)
    }
  }
}
</script>

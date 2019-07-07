<template>
  <v-card>
    <v-card-title primary-title class="headline">
      <slot>Actions</slot>
    </v-card-title>

    <v-container fluid pt-0 px-3>
      <v-layout row wrap>
        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="items"
            disable-initial-sort
            hide-actions
            item-key="key"
          >
            <template v-slot:items="{ item }">
              <td class="text-xs-center text-no-wrap px-0">
                <v-icon>{{ item.icon }}</v-icon>
              </td>

              <td class="py-3"></td>

              <td class="text-xs-right text-no-wrap">
                <v-icon v-if="editing" color="tertiary" @click="remove(item)"
                  >remove_circle</v-icon
                >
              </td>
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
          <v-list-tile
            v-for="(item, index) in addItems"
            :key="index"
            @click="add(item)"
          >
            <v-list-tile-avatar>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
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
        title: 'Exclude',
        subtitle: 'Datapoints will be excluded from downloads and graphs.'
      },
      {
        icon: 'flag',
        title: 'Flag',
        subtitle: 'Datapoints will marked with a textual flag.'
      }
    ],

    headers: [
      {
        align: 'center',
        sortable: false,
        value: 'key',
        width: '10%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Description',
        width: '60%'
      },
      {
        sortable: false,
        value: 'key'
      }
    ]
  }),

  computed: {
    items() {
      return []
    }
  },

  methods: {
    add(item) {},

    remove(item) {}
  }
}
</script>

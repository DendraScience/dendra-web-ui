<template>
  <v-card>
    <v-card-title primary-title class="headline">
      <slot>External references</slot>
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
              <td>{{ item.type }}</td>
              <td>{{ item.identifier }}</td>
              <td>{{ item.url }}</td>

              <td class="text-xs-right text-no-wrap">
                <span v-if="editing">
                  <v-icon color="tertiary" class="mr-2" @click="edit(item)"
                    >edit</v-icon
                  >
                  <v-icon color="tertiary" @click="remove(item)"
                    >remove_circle</v-icon
                  >
                </span>
              </td>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>

    <v-card-actions v-if="editing">
      <v-btn color="primary" @click="add">
        <v-icon>add</v-icon>
      </v-btn>
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
    headers: [
      {
        align: 'left',
        sortable: false,
        text: 'Type',
        value: 'type',
        width: '20%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Identifier',
        value: 'identifier',
        width: '20%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'URL',
        value: 'url',
        width: '40%'
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
    add() {},

    remove(item) {}
  }
}
</script>

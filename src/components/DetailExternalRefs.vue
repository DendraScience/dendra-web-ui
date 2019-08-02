<template>
  <v-card>
    <v-card-title class="headline">
      <slot>External references</slot>
    </v-card-title>

    <v-container fluid pt-0 px-4>
      <v-layout wrap>
        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="items"
            hide-default-footer
            item-key="key"
          >
            <template v-slot:item.url="{ item }">
              <a v-if="item.url" :href="item.url" target="_blank">{{
                item.url
              }}</a>
            </template>

            <template v-slot:item.icons="{ item }" class="text-no-wrap">
              <span v-if="editing">
                <v-icon color="tertiary" class="mr-2" @click="edit(item)"
                  >edit</v-icon
                >
                <v-icon color="tertiary" @click="remove(item)"
                  >remove_circle</v-icon
                >
              </span>
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
        sortable: true,
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
        align: 'right',
        sortable: false,
        value: 'icons'
      }
    ]
  }),

  computed: {
    externalRefs() {
      return this.value.external_refs || []
    },

    items() {
      return this.externalRefs
    }
  },

  methods: {
    add() {},

    edit(item) {},

    remove(item) {}
  }
}
</script>

<template>
  <v-card>
    <v-card-title class="headline">
      <slot>External references</slot>
    </v-card-title>

    <v-container fluid pt-0 px-4>
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
            <template v-slot:item.url="{ item }">
              <a
                v-if="item.url"
                :href="item.url"
                style="word-break: break-all;"
                target="_blank"
                >{{ item.url }}</a
              >
            </template>

            <template v-slot:item.icons="{ item }">
              <span v-if="editing" class="text-no-wrap">
                <v-icon color="tertiary" class="mr-2" @click="edit(item)"
                  >edit</v-icon
                >
                <v-icon color="tertiary" @click="remove(item)"
                  >mdi-minus-circle</v-icon
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
        text: 'Type',
        value: 'type',
        width: '30%'
      },
      {
        align: 'left',
        text: 'Identifier',
        value: 'identifier',
        width: '30%'
      },
      {
        align: 'left',
        text: 'URL',
        value: 'url'
      },
      {
        align: 'right',
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
    add() {
      this.$emit('add')
    },

    edit(item) {
      this.$emit('edit', item)
    },

    remove(item) {
      this.$emit('remove', item)
    }
  }
}
</script>

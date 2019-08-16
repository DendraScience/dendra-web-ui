<template>
  <v-card>
    <v-card-title class="headline">
      <slot>External links</slot>
    </v-card-title>

    <v-container fluid pt-0 px-4>
      <v-layout>
        <v-flex>
          <v-data-table
            :headers="headers"
            :items="items"
            :mobile-breakpoint="0"
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
        sortable: false,
        text: 'Title',
        value: 'title',
        width: '40%'
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
    externalLinks() {
      return this.value.external_links || []
    },

    items() {
      return this.externalLinks.map((item, key) => {
        return Object.assign({ key }, item)
      })
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

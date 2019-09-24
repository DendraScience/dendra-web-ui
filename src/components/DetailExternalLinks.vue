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
                >{{ item.url | truncate({ length: 50 }) }}</a
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
import itemEditing from '@/mixins/item-editing'

export default {
  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    headers: [
      {
        align: 'left',
        text: 'Title',
        value: 'title',
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
    externalLinks() {
      return this.value.external_links || []
    },

    items() {
      return this.externalLinks.map((item, key) => {
        return Object.assign({ key }, item)
      })
    }
  }
}
</script>

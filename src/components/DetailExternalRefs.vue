<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline">
          <slot>External references</slot>
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
      <v-btn color="primary" @click="add">
        <v-icon>{{ mdiPlus }}</v-icon>
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
  }
}
</script>

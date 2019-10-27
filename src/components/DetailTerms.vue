<template>
  <v-card>
    <v-card-title class="headline">
      <slot>Vocabulary terms</slot>
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
            <template v-slot:item.key="{ item }" class="text-no-wrap px-0">
              <v-avatar color="grey darken-1" size="25">
                <span class="white--text caption">{{ item.key }}</span>
              </v-avatar>
            </template>

            <template v-slot:item.value="{ item }">
              <pre-block :value="item.value" />
            </template>

            <template v-slot:item.icons="{ item }" class="text-no-wrap">
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
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" v-on="on">
            <v-icon>add</v-icon>
          </v-btn>
        </template>

        <feathers-vuex-find
          v-slot="{ items: schemes }"
          :query="{
            is_enabled: true,
            $sort: { name: 1 }
          }"
          service="schemes"
        >
          <v-list two-line subheader>
            <v-list-item
              v-for="scheme in schemes"
              :key="scheme._id"
              :disabled="terms[scheme._id] !== undefined"
              @click="add({ key: scheme._id })"
            >
              <v-list-item-avatar color="grey darken-1" size="25">
                <span class="white--text caption">{{ scheme._id }}</span>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{ scheme.name }}</v-list-item-title>
                <v-list-item-subtitle>{{
                  scheme.description
                }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </feathers-vuex-find>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<script>
import _sortBy from 'lodash/sortBy'
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
    headers: [
      {
        align: 'center',
        value: 'key',
        width: '50px'
      },
      {
        align: 'left',
        text: 'Terms',
        value: 'value',
        width: '60%'
      },
      {
        align: 'right',
        value: 'icons'
      }
    ]
  }),

  computed: {
    terms() {
      return this.value.terms || {}
    },

    items() {
      const { terms } = this

      return _sortBy(
        Object.keys(terms).map(key => {
          const item = terms[key]
          return {
            icon: 'mdi-book-open-variant',
            key,
            value: jsonFormat(item)
          }
        }),
        ['key']
      )
    }
  }
}
</script>

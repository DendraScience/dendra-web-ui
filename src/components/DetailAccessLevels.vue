<template>
  <v-card>
    <v-card-title class="headline">
      <slot v-if="editing">Access level overrides</slot>
      <slot v-else>Access levels</slot>
    </v-card-title>

    <v-container fluid pt-0 px-4>
      <v-layout v-if="!editing">
        <v-flex>
          <v-tabs v-model="tabIndex">
            <v-tab>Resolved</v-tab>
            <v-tab>Overrides</v-tab>
          </v-tabs>
        </v-flex>
      </v-layout>

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
import { accessLevelTexts } from '@/lib/access-level'

export default {
  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    addItems: [
      {
        icon: 'mdi-account-multiple',
        key: 'member_level',
        target: 'member',
        title: 'Member access level',
        subtitle: 'Specify data visibility for organization members.'
      },
      {
        icon: 'mdi-globe-model',
        key: 'public_level',
        target: 'public',
        title: 'Public access level',
        subtitle: 'Specify data visibility for the public.'
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
    ],

    tabIndex: 0
  }),

  computed: {
    accessLevels() {
      return this.editing || this.tabIndex === 1
        ? this.value.access_levels || {}
        : this.value.access_levels_resolved || {}
    },

    items() {
      const items = []
      const { accessLevels } = this

      if (accessLevels.member_level !== undefined)
        items.push({
          icon: 'mdi-account-multiple',
          target: 'member',
          key: 'member_level',
          description: accessLevelTexts.member[accessLevels.member_level]
        })

      if (accessLevels.public_level !== undefined)
        items.push({
          icon: 'mdi-globe-model',
          target: 'public',
          key: 'public_level',
          description: accessLevelTexts.public[accessLevels.public_level]
        })

      return items
    }
  },

  methods: {
    add(item) {
      this.$emit('add', item)
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

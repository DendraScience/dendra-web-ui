<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline">
          <slot v-if="editing">Access level overrides</slot>
          <slot v-else>Access levels</slot>
        </v-col>
      </v-row>

      <v-row v-if="!editing" dense>
        <v-col>
          <v-tabs v-model="tabIndex">
            <v-tab>Resolved</v-tab>
            <v-tab>Overrides</v-tab>
          </v-tabs>
          <v-divider />
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
            <template #item.type="{ item }" class="text-no-wrap px-0">
              <v-icon>{{ item.icon }}</v-icon>
            </template>

            <template #item.icons="{ item }">
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
      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn color="primary" v-on="on">
            <v-icon>{{ mdiPlus }}</v-icon>
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
import { mdiAccountMultiple, mdiGlobeModel } from '@mdi/js'
import { accessLevelTexts } from '@/lib/access-level'
import itemEditing from '@/mixins/item-editing'

export default {
  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    addItems: [
      {
        icon: mdiAccountMultiple,
        key: 'member_level',
        subtitle: 'Specify data visibility for organization members.',
        target: 'member',
        title: 'Member access level'
      },
      {
        icon: mdiGlobeModel,
        key: 'public_level',
        subtitle: 'Specify data visibility for the public.',
        target: 'public',
        title: 'Public access level'
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
          description: accessLevelTexts.member[accessLevels.member_level],
          icon: mdiAccountMultiple,
          key: 'member_level',
          target: 'member'
        })

      if (accessLevels.public_level !== undefined)
        items.push({
          description: accessLevelTexts.public[accessLevels.public_level],
          icon: mdiGlobeModel,
          key: 'public_level',
          target: 'public'
        })

      return items
    }
  }
}
</script>

<template>
  <v-card>
    <v-card-title class="headline">
      <slot>Members involved</slot>
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
            <template v-slot:item.type="{ item }" class="text-no-wrap px-0">
              <v-icon>{{ item.icon }}</v-icon>
            </template>

            <template v-slot:item.roles="{ item }" class="py-4">
              <v-chip
                v-for="role in item.roles"
                :key="role"
                class="mr-1 my-1"
                label
                >{{ role }}</v-chip
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
import _sortBy from 'lodash/sortBy'
import _uniq from 'lodash/uniq'

import { mapActions, mapGetters } from 'vuex'

export default {
  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    headers: [
      {
        align: 'center',
        value: 'type',
        width: '50px'
      },
      {
        align: 'left',
        text: 'Name',
        value: 'name',
        width: '20%'
      },
      {
        align: 'left',
        text: 'Email',
        value: 'email',
        width: '20%'
      },
      {
        align: 'left',
        text: 'Roles',
        value: 'roles'
      },
      {
        align: 'right',
        value: 'icons'
      }
    ]
  }),

  computed: {
    ...mapGetters({
      getPerson: 'persons/get'
    }),

    involvedParties() {
      return this.value.involved_parties
    },

    items() {
      return _sortBy(
        this.involvedParties.map((item, key) => {
          const id = item.person_id
          const person = this.getPerson(id)
          return {
            id,
            icon: 'mdi-account-box',
            target: 'person',
            key,
            name: person ? person.full_name || person.name : id,
            email: person && person.email,
            roles: item.roles || []
          }
        }),
        ['name']
      )
    }
  },

  mounted() {
    this.fetch()
  },

  methods: {
    ...mapActions({
      fetchPersons: 'persons/find'
    }),

    add() {
      this.$emit('add')
    },

    edit(item) {
      this.$emit('edit', item)
    },

    remove(item) {
      this.$emit('remove', item)
    },

    async fetch() {
      const personIds = this.involvedParties
        .filter(party => party.person_id)
        .map(party => party.person_id)

      // Fetch referenced persons
      if (personIds.length) {
        await this.fetchPersons({
          query: {
            _id: { $in: _uniq(personIds) },
            $limit: 2000,
            $select: ['_id', 'email', 'full_name', 'name']
          }
        })
      }
    }
  }
}
</script>

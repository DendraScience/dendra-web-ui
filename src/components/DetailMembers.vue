<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline">
          <slot>Members involved</slot>
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

            <template #item.roles="{ item }" class="py-4">
              <v-chip
                v-for="role in item.roles"
                :key="role"
                class="mr-1 my-1"
                label
                >{{ role }}</v-chip
              >
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
      <v-btn color="primary" @click="add">
        <v-icon>{{ mdiPlus }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import _sortBy from 'lodash/sortBy'
import { mapActions, mapGetters, mapState } from 'vuex'
import itemEditing from '@/mixins/item-editing'
import { mdiAccountBox } from '@mdi/js'

export default {
  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  async fetch() {
    const personIds = this.involvedParties
      .filter(party => party.person_id)
      .map(party => party.person_id)

    // HACK: Always include the current user
    if (this.auth.user) personIds.push(this.auth.user.person_id)

    // Fetch referenced persons
    if (personIds.length) {
      await this.fetchPersons({
        query: {
          _id: { $in: personIds },
          $limit: 2000,
          $select: ['_id', 'email', 'full_name', 'name']
        }
      })
    }
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
    ...mapState(['auth']),

    involvedParties() {
      return this.value.involved_parties
    },

    items() {
      return _sortBy(
        this.involvedParties.map((item, key) => {
          const id = item.person_id
          const person = this.getPerson(id)

          return {
            email: person && person.email,
            icon: mdiAccountBox,
            id,
            key,
            name: person ? person.full_name || person.name : id,
            roles: item.roles || [],
            target: 'person'
          }
        }),
        ['name']
      )
    }
  },

  methods: {
    ...mapActions({
      fetchPersons: 'persons/find'
    })
  }
}
</script>

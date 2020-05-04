<template>
  <ValidationProvider name="person" rules="required">
    <v-select
      v-model="value.personId"
      :disabled="disabled"
      :items="items"
      :prepend-inner-icon="mdiAccountBox"
      hide-details
      label="Member"
      solo
    ></v-select>
  </ValidationProvider>
</template>

<script>
import _sortBy from 'lodash/sortBy'
import { mapActions, mapGetters } from 'vuex'
import { ValidationProvider } from 'vee-validate'

export default {
  components: {
    ValidationProvider
  },

  props: {
    disabled: { default: false, type: Boolean },
    org: { default: null, type: Object },
    value: { default: null, type: Object }
  },

  data: () => ({
    items: []
  }),

  computed: {
    ...mapGetters({
      getPerson: 'persons/get'
    })
  },

  mounted() {
    this.fetch()
  },

  methods: {
    ...mapActions({
      fetchMemberships: 'memberships/find',
      fetchPersons: 'persons/find'
    }),

    async fetch() {
      let items = []

      const res = await this.fetchMemberships({
        query: {
          organization_id: this.org._id,
          $limit: 2000,
          $select: ['_id', 'person_id']
        }
      })

      if (res && res.data && res.data.length) {
        const memberships = res.data
        const personIds = memberships.map(membership => membership.person_id)

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

        items = _sortBy(
          memberships.map(membership => {
            const id = membership.person_id
            const person = this.getPerson(membership.person_id)
            return {
              text: person ? person.full_name || person.name : id,
              value: id
            }
          }),
          ['text']
        )
      }

      this.items = items
    }
  }
}
</script>

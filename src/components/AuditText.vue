<template>
  <v-card-text class="grey--text pt-0">
    <span v-if="value.created_at"
      >Created {{ value.created_at | moment('', ['fromNow']) }} by
      {{ creator }}</span
    ><br />
    <span v-if="value.updated_at"
      >Updated {{ value.updated_at | moment('', ['fromNow']) }} by
      {{ updator }}</span
    ><br />
  </v-card-text>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  props: {
    value: { type: Object, required: true }
  },

  computed: {
    ...mapGetters({
      getUser: 'users/get'
    }),

    creator() {
      const user = this.getUser(this.value.created_by)
      return user ? user.full_name || user.name : 'Unknown'
    },

    updator() {
      const user = this.getUser(this.value.updated_by)
      return user ? user.full_name || user.name : 'Unknown'
    }
  },

  mounted() {
    this.fetch()
  },

  methods: {
    ...mapActions({
      fetchUsers: 'users/find'
    }),

    async fetch() {
      const userIds = []

      if (this.value.created_by) userIds.push(this.value.created_by)
      if (this.value.updated_by) userIds.push(this.value.updated_by)

      // Fetch referenced users
      if (userIds.length) {
        await this.fetchUsers({
          query: {
            _id: { $in: userIds },
            $limit: 2000,
            $select: ['_id', 'full_name', 'name']
          }
        })
      }
    }
  }
}
</script>

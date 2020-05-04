<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-card outlined>
        <v-card-subtitle>
          <h4 v-if="value.created_at" class="subtitle-2 mb-1">
            Created {{ value.created_at | timeFromNow }} by:
            <span class="font-weight-regular">{{ creator }}</span>
          </h4>

          <h4 v-if="value.updated_at" class="subtitle-2">
            Updated {{ value.updated_at | timeFromNow }} by:
            <span class="font-weight-regular">{{ updator }}</span>
          </h4>
        </v-card-subtitle>
      </v-card>
    </v-col>
  </v-row>
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

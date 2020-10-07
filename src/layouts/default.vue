<template>
  <v-app>
    <main-navigation-drawer />
    <main-toolbar />

    <v-main>
      <status-bar v-model="status" />

      <div>
        <nuxt />
      </div>
    </v-main>

    <session-expired-dialog @status="status = $event" />
  </v-app>
</template>

<script>
import MainNavigationDrawer from '@/components/MainNavigationDrawer'
import MainToolbar from '@/components/MainToolbar'
import SessionExpiredDialog from '@/components/SessionExpiredDialog.vue'
import StatusBar from '@/components/StatusBar'

export default {
  components: {
    MainNavigationDrawer,
    MainToolbar,
    SessionExpiredDialog,
    StatusBar
  },

  data: () => ({
    status: null
  }),

  mounted() {
    this.$bus.$on('status', this.onStatus)
  },

  beforeDestroy() {
    this.$bus.$off('status', this.onStatus)
  },

  methods: {
    onStatus(value) {
      this.status = value
    }
  }
}
</script>

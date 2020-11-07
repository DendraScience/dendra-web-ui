<template>
  <v-app v-scroll="onScroll">
    <download-navigation-drawer />
    <main-navigation-drawer />
    <main-toolbar />

    <v-main app>
      <status-bar v-model="status" />

      <div>
        <nuxt />
      </div>
    </v-main>

    <session-expired-dialog @status="status = $event" />
  </v-app>
</template>

<script>
import DownloadNavigationDrawer from '@/components/DownloadNavigationDrawer'
import MainNavigationDrawer from '@/components/MainNavigationDrawer'
import MainToolbar from '@/components/MainToolbar'
import SessionExpiredDialog from '@/components/SessionExpiredDialog.vue'
import StatusBar from '@/components/StatusBar'
import { mapMutations } from 'vuex'

export default {
  components: {
    DownloadNavigationDrawer,
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
    ...mapMutations(['setTop']),

    onScroll(e) {
      this.setTop(e.target.documentElement.scrollTop < 64)
    },

    onStatus(value) {
      this.status = value
    }
  }
}
</script>

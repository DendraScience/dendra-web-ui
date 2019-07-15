<template>
  <v-app light>
    <main-navigation-drawer />
    <main-toolbar />

    <v-content>
      <status-bar v-model="status" />

      <v-container fluid pa-0>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import MainNavigationDrawer from '@/components/MainNavigationDrawer'
import MainToolbar from '@/components/MainToolbar'
import StatusBar from '@/components/StatusBar'

export default {
  components: {
    MainNavigationDrawer,
    MainToolbar,
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

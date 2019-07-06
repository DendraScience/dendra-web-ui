<template>
  <v-app light>
    <main-navigation-drawer />
    <main-toolbar />

    <v-content>
      <v-container fluid pa-0>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import MainNavigationDrawer from '@/components/MainNavigationDrawer'
import MainToolbar from '@/components/MainToolbar'

export default {
  components: {
    MainNavigationDrawer,
    MainToolbar
  }
}
</script>

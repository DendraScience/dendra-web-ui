<template>
  <v-app light>
    <main-navigation-drawer />
    <main-toolbar />

    <v-toolbar
      v-show="editing"
      app
      color="primary"
      dark
      dense
      fixed
      style="margin-top: 64px;"
    >
      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn flat @click="$bus.$emit('editor-save')">Save</v-btn>
        <v-btn flat @click="$bus.$emit('editor-cancel')">Cancel</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content :style="editing ? { marginTop: '48px' } : {}">
      <v-container fluid pa-0>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import MainNavigationDrawer from '@/components/MainNavigationDrawer'
import MainToolbar from '@/components/MainToolbar'

import { mapState } from 'vuex'

export default {
  components: {
    MainNavigationDrawer,
    MainToolbar
  },

  computed: {
    ...mapState('ux', ['editing'])
  }
}
</script>

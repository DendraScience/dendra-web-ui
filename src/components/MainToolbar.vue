<template>
  <v-app-bar
    :flat="isHome && top"
    app
    color="grey darken-4"
    dark
    fixed
    height="64"
  >
    <v-app-bar-nav-icon @click="toggleMainDrawer" />

    <v-toolbar-title>
      <nuxt-link
        v-if="orgSlug"
        :to="{
          name: 'orgs-orgSlug',
          params: {
            orgSlug
          }
        }"
        class="text-decoration-none white--text"
        exact
      >
        {{ orgName }}
      </nuxt-link>

      <nuxt-link v-else to="/" class="text-decoration-none white--text" exact>
        {{ longSiteName || 'Dendra.Science' }}</nuxt-link
      >
    </v-toolbar-title>

    <v-spacer />

    <v-menu v-if="auth.payload" offset-y left>
      <template #activator="{ on }">
        <div class="d-flex flex-nowrap flex-row">
          <v-badge
            :color="
              pendingDownloads.length
                ? 'warning'
                : readyDownloads.length
                ? 'info'
                : 'transparent'
            "
            :content="pendingDownloads.length || readyDownloads.length || ''"
            left
            offset-x="20"
            offset-y="20"
          >
            <v-btn dark icon @click="toggleDownloadDrawer">
              <v-icon>{{ mdiDownload }}</v-icon>
            </v-btn>
          </v-badge>

          <v-btn dark icon v-on="on">
            <v-icon>{{ mdiAccount }}</v-icon>
          </v-btn>
        </div>
      </template>

      <v-card>
        <v-list v-if="auth.user" dark three-line>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ auth.user.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ auth.user.email }}</v-list-item-subtitle
              >
              <v-list-item-subtitle class="mt-2">
                <v-chip
                  v-for="role in auth.user.roles"
                  :key="role"
                  color="primary"
                  label
                  small
                  >{{ role }}</v-chip
                ></v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-list>
          <v-list-item to="/settings">
            <v-list-item-title>User settings</v-list-item-title>
          </v-list-item>

          <v-list-item @click="logoutRedirect">
            <v-list-item-title>Log out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <v-btn v-else color="white" nuxt outlined rounded to="/login">Log in</v-btn>
  </v-app-bar>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import downloads from '@/mixins/downloads'

export default {
  mixins: [downloads],

  computed: {
    ...mapGetters({
      orgColor: 'orgColor',
      orgName: 'orgName',
      orgSlug: 'orgSlug',
      toolBarPresentation: 'toolBarPresentation'
    }),

    ...mapState(['auth', 'top']),

    isHome() {
      return this.$route.name === 'index'
    }
  },

  methods: {
    ...mapActions('auth', ['logout']),

    ...mapMutations({
      setLocal: 'session/setLocal',
      toggleDownloadDrawer: 'ux/toggleDownloadDrawer',
      toggleMainDrawer: 'ux/toggleMainDrawer'
    }),

    async logoutRedirect() {
      // Native logout
      this.setLocal(true)
      await this.logout()

      window.location.assign(this.canopyLogoutURL)
    }
  }
}
</script>

<template>
  <v-app-bar
    :color="isHome && top ? 'transparent' : 'grey darken-4'"
    :flat="isHome && top"
    app
    dark
    fixed
    height="64"
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />

    <v-toolbar-title>
      <nuxt-link
        v-if="orgSlug"
        :to="{
          name: 'orgs-orgSlug',
          params: {
            orgSlug
          }
        }"
        class="title-link white--text"
        exact
      >
        {{ orgName }}
      </nuxt-link>

      <span v-else> Dendra.Science </span>
    </v-toolbar-title>

    <v-spacer />

    <v-menu v-if="auth.payload" offset-y left>
      <template v-slot:activator="{ on }">
        <div>
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

    <v-btn v-else color="white" outlined rounded to="/login">Log in</v-btn>
  </v-app-bar>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      orgName: 'orgName',
      orgSlug: 'orgSlug'
    }),

    ...mapState(['auth', 'top']),

    isHome() {
      return this.$route.name === 'index'
    }
  },

  methods: {
    ...mapActions('auth', ['logout']),

    ...mapMutations({
      toggleDrawer: 'ux/toggleDrawer'
    }),

    logoutRedirect() {
      // Force Vuex reset with $router.go
      this.logout().then(() => this.$router.go())
    }
  }
}
</script>

<style scoped>
.title-link {
  text-decoration: none;
}
.title-link:hover {
  text-decoration: underline;
}
</style>

<template>
  <v-toolbar
    :color="$route.name === 'index' ? 'secondary' : ''"
    app
    dark
    fixed
    prominent
  >
    <v-toolbar-side-icon @click="toggleDrawer" />
    <v-toolbar-title>{{ orgName }}</v-toolbar-title>
    <v-spacer />
    <!-- TODO: Deprecate -->
    <!--
    <v-btn icon>
      <v-icon>search</v-icon>
    </v-btn>
 -->
    <v-menu v-if="auth.payload" offset-y left>
      <template v-slot:activator="{ on }">
        <v-btn dark icon v-on="on">
          <v-icon>person</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-list v-if="auth.user" dark three-line>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>{{ auth.user.name }}</v-list-tile-title>
              <v-list-tile-sub-title>
                {{ auth.user.email }}</v-list-tile-sub-title
              >
              <v-list-tile-sub-title>
                <v-chip
                  v-for="role in auth.user.roles"
                  :key="role"
                  color="primary"
                  label
                  small
                  >{{ role }}</v-chip
                ></v-list-tile-sub-title
              >
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-list>
          <v-list-tile to="/settings">
            <v-list-tile-title>User settings</v-list-tile-title>
          </v-list-tile>

          <v-list-tile @click="logoutRedirect">
            <v-list-tile-title>Log out</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-menu>

    <v-btn v-else color="white" outline round to="/login">Log in</v-btn>
  </v-toolbar>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      orgName: 'orgName'
    }),

    ...mapState(['auth'])
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

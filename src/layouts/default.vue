<template>
  <v-app light>
    <v-navigation-drawer v-model="drawer" app dark>
      <v-toolbar flat prominent color="transparent">
        <!-- TODO: Remove this -->
        <!--
        <v-text-field
          flat
          full-width
          solo-inverted
          hide-details
          single-line
          label="Search"
          clearable
        ></v-text-field>
        -->
      </v-toolbar>

      <div v-for="(list, l) in filteredLists" :key="l">
        <v-list>
          <v-list-tile
            v-for="(item, i) in list.items"
            :key="i"
            :disabled="item.disabled"
            :to="item.org ? { name: item.name, params: { orgSlug } } : item.to"
            exact
            nuxt
          >
            <v-list-tile-action>
              <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title v-text="item.title" />
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-divider />
      </div>
    </v-navigation-drawer>

    <v-toolbar
      app
      flat
      prominent
      dark
      :color="$route.name === 'index' ? 'green' : ''"
    >
      <v-toolbar-side-icon @click="drawer = !drawer" />
      <v-toolbar-title>{{ orgName }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon>
        <v-icon>search</v-icon>
      </v-btn>

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

    <v-content>
      <v-container fluid pa-0>
        <nuxt />
      </v-container>
      <!-- TODO: Remove this -->
      <!--
      <v-footer height="auto" color="green darken-1">
        <v-layout justify-center row wrap>
          <v-flex xs12 py-3 text-xs-center white--text>
            <v-btn color="white" flat large round>Home</v-btn>
            <v-btn color="white" flat large round>About</v-btn>
            <v-btn color="white" flat large round>Team</v-btn>
            <v-btn color="white" flat large round>Contact Us</v-btn>
          </v-flex>

          <v-flex xs12 py-3 blue darken-1 white--text text-xs-center>
            &copy;2018 — <strong>Dendra</strong>
          </v-flex>
        </v-layout>
      </v-footer>
     -->
    </v-content>
  </v-app>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  data() {
    return {
      drawer: this.$vuetify.breakpoint.lgAndUp,

      lists: [
        {
          items: [
            {
              title: 'Dendra home',
              to: '/'
            }
          ]
        },
        {
          items: [
            {
              can: ['read', 'organizations'],
              title: 'Organizations',
              to: '/orgs'
            },
            {
              disabled: true,
              title: 'Vocabulary',
              to: '/vocabulary'
            }
          ]
        },
        {
          items: [
            {
              org: true,
              disabled: true,
              name: 'orgs-orgSlug-stations',
              title: 'Stations',
              to: '/stations'
            },
            {
              org: true,
              name: 'orgs-orgSlug-datastreams',
              title: 'Datastreams',
              to: '/datastreams'
            },
            {
              org: true,
              disabled: true,
              name: 'orgs-orgSlug-annotations',
              title: 'Annotations',
              to: '/annotation'
            },
            {
              org: true,
              disabled: true,
              name: 'orgs-orgSlug-equipment',
              title: 'Equipment',
              to: '/equipment'
            },
            {
              org: true,
              disabled: true,
              name: 'orgs-orgSlug-people',
              title: 'People',
              to: '/people'
            },
            {
              org: true,
              disabled: true,
              name: 'orgs-orgSlug-teams',
              title: 'Teams',
              to: '/teams'
            }
          ]
        },
        {
          items: [
            {
              auth: false,
              title: 'Log in',
              to: '/login'
            }
          ]
        }
      ],
      title: 'Vuetify.js'
    }
  },

  computed: {
    ...mapGetters({
      orgName: 'orgName',
      orgSlug: 'orgSlug'
    }),

    ...mapState(['auth']),

    filteredLists() {
      const auth = !!this.auth.payload
      const org = !!this.orgSlug
      const { $can } = this

      return this.lists
        .map(list => {
          return {
            items: list.items.filter(item => {
              return (
                (item.auth === undefined || item.auth === auth) &&
                (item.org === undefined || item.org === org) &&
                (item.can === undefined || $can(...item.can))
              )
            })
          }
        })
        .filter(lists => lists.items.length)
    }
  },

  methods: {
    ...mapActions('auth', ['logout']),

    logoutRedirect() {
      // Force Vuex reset with $router.go
      this.logout().then(() => this.$router.go())
    }
  }
}
</script>

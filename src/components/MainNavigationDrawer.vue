<template>
  <v-navigation-drawer v-model="drawer" app dark fixed>
    <v-toolbar flat color="transparent">
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
      <v-subheader v-if="list.header">{{ list.header }}</v-subheader>

      <v-list>
        <v-list-item
          v-for="(item, i) in list.items"
          :key="i"
          :disabled="item.disabled"
          :to="item.org ? { name: item.name, params: { orgSlug } } : item.to"
          exact
          nuxt
        >
          <v-list-item-action>
            <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider />
    </div>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  data() {
    return {
      lists: [
        {
          items: [
            {
              icon: 'home',
              title: 'Dendra home',
              to: '/'
            },
            {
              can: ['read', 'organizations'],
              title: 'Organization list',
              to: '/orgs'
            },
            // TODO: Implement later
            // {
            //   can: ['read', 'stations'],
            //   title: 'Stations',
            //   to: '/stations'
            // },
            {
              disabled: true,
              title: 'Vocabulary',
              to: '/vocabulary'
            },
            {
              hidden: process.env.NODE_ENV === 'production',
              title: 'Theme',
              to: '/theme'
            }
          ]
        },
        {
          header: 'ORG_NAME',
          items: [
            {
              org: true,
              name: 'orgs-orgSlug',
              title: 'Overview',
              to: '/'
            },
            {
              org: true,
              name: 'orgs-orgSlug-stationStatus',
              title: 'Station status',
              to: '/stationStatus'
            },
            {
              org: true,
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
              title: 'Contact',
              to: '/contact'
            },
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

    drawer: {
      set(value) {
        this.$store.commit('ux/setDrawer', value)
      },
      get() {
        return this.$store.state.ux.drawer
      }
    },

    filteredLists() {
      const auth = !!this.auth.payload
      const org = !!this.orgSlug
      const { $can, orgName } = this

      return this.lists
        .map(list => {
          return {
            header: list.header === 'ORG_NAME' ? orgName : list.header,
            items: list.items.filter(item => {
              return (
                !item.hidden &&
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

  created() {
    if (this.$store.state.ux.drawer === null)
      this.$store.commit('ux/setDrawer', this.$vuetify.breakpoint.lgAndUp)
  }
}
</script>

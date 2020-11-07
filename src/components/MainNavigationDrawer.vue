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

    <div v-for="(list, listIndex) in filteredLists" :key="listIndex">
      <v-subheader v-if="list.header">{{ list.header }}</v-subheader>

      <v-list>
        <v-list-item
          v-for="(item, itemIndex) in list.items"
          :key="itemIndex"
          :disabled="item.disabled"
          :to="
            item.org
              ? {
                  name: item.name,
                  params: { orgSlug },
                  query: item.query
                }
              : item.to
          "
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
import {
  mdiHome,
  mdiChartMultiple,
  mdiChartTimelineVariant,
  mdiCheckCircle,
  mdiInformation,
  mdiFileTree,
  mdiFormatPaint,
  mdiHexagonSlice6,
  mdiLoginVariant,
  mdiNature,
  mdiNoteOutline,
  mdiTag,
  mdiOfficeBuilding,
  mdiViewGrid
} from '@mdi/js'

export default {
  data() {
    return {
      lists: [
        {
          items: [
            {
              icon: mdiHome,
              title: 'Dendra home',
              to: '/'
            },
            {
              can: ['read', 'organizations'],
              icon: mdiFileTree,
              title: 'Organization list',
              to: '/orgs'
            },
            {
              icon: mdiTag,
              org: false,
              title: 'Vocabulary',
              to: '/vocabulary'
            },
            {
              hidden: process.env.NODE_ENV === 'production',
              icon: mdiFormatPaint,
              org: false,
              title: 'Theme',
              to: '/theme'
            },
            {
              icon: mdiInformation,
              org: false,
              title: 'About',
              to: '/about'
            },
            {
              auth: false,
              icon: mdiLoginVariant,
              title: 'Log in',
              to: '/login'
            }
          ]
        },
        {
          header: 'Equipment Library',
          items: [
            {
              can: ['read', 'companies'],
              icon: mdiOfficeBuilding,
              title: 'Companies',
              to: '/companies'
            },
            {
              can: ['read', 'thing-types'],
              icon: mdiHexagonSlice6,
              title: 'Equipment',
              to: '/equipment'
            }
          ]
        },
        {
          header: 'ORG_NAME',
          items: [
            {
              icon: mdiViewGrid,
              org: true,
              name: 'orgs-orgSlug',
              title: 'Overview'
            },
            {
              icon: mdiCheckCircle,
              org: true,
              name: 'orgs-orgSlug-status',
              title: 'Station status'
            },
            {
              icon: mdiChartMultiple,
              org: true,
              name: 'orgs-orgSlug-datastreams',
              query: {
                faceted: true,
                scheme: 'dq'
              },
              title: 'Data query'
            }
          ]
        },
        {
          items: [
            {
              icon: mdiNature,
              org: true,
              name: 'orgs-orgSlug-stations',
              title: 'Stations'
            },
            {
              icon: mdiChartTimelineVariant,
              org: true,
              name: 'orgs-orgSlug-datastreams',
              title: 'Datastreams'
            },
            {
              icon: mdiNoteOutline,
              org: true,
              name: 'orgs-orgSlug-annotations',
              title: 'Annotations'
            }
            // {
            //   org: true,
            //   disabled: true,
            //   name: 'orgs-orgSlug-people',
            //   title: 'People'
            // }
            // {
            //   org: true,
            //   disabled: true,
            //   name: 'orgs-orgSlug-teams',
            //   title: 'Teams'
            // }
          ]
        }
      ]
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
        this.$store.commit('ux/setMainDrawer', value)
      },
      get() {
        return this.$store.state.ux.mainDrawer
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
    if (this.$store.state.ux.mainDrawer === null)
      this.$store.commit('ux/setMainDrawer', this.$vuetify.breakpoint.lgAndUp)
  }
}
</script>

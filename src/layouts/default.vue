<template>
  <div :class="isMenuOpen ? 'drawer-left-open' : ''">
    <!-- Left Nav Drawer -->
    <div class="bg-faded drawer-left drawer-left-shadow-inset h-100">
      <nav-header class="bg-color-gray" fa-class="fa-close" @clicked="toggleMenu" />

      <section class="px-2 py-2 border-bottom-darken-10" v-if="organization">
        <nav class="nav nav-pills text-truncate flex-column">
          <router-link class="nav-link small" to="/" exact>Dendra Home</router-link>
        </nav>
      </section>

      <section class="px-2 py-2 border-bottom-darken-10" v-if="orgSlug">
        <nav class="nav nav-pills text-truncate flex-column">
          <router-link class="nav-link" :to="{name: 'orgSlug', params: {orgSlug: orgSlug}}" exact>Info</router-link>
          <router-link class="nav-link" :to="{name: 'orgSlug-equipment', params: {orgSlug: orgSlug}}">Equipment</router-link>
          <router-link class="nav-link" :to="{name: 'orgSlug-metadata', params: {orgSlug: orgSlug}}">Metadata</router-link>
          <router-link class="nav-link" :to="{name: 'orgSlug-stations', params: {orgSlug: orgSlug}}">Stations</router-link>
          <router-link class="nav-link" :to="{name: 'orgSlug-status', params: {orgSlug: orgSlug}}">Status</router-link>
          <router-link class="nav-link" :to="{name: 'orgSlug-query', params: {orgSlug: orgSlug}}">Query</router-link>
        </nav>
      </section>

      <section class="px-2 py-2  border-bottom-darken-10" v-else>
        <nav class="nav nav-pills text-truncate flex-column">
          <router-link class="nav-link" to="/" exact>Home</router-link>
          <router-link class="nav-link" to="about">About</router-link>
          <router-link class="nav-link" to="equipment">Equipment</router-link>
          <router-link class="nav-link" to="query">Query</router-link>
          <router-link class="nav-link" to="services">Services</router-link>
        </nav>
      </section>

      <section class="px-2 py-2 border-bottom-darken-10" v-if="orgSlug && hasDashboards">
        <h6 class="text-muted text-uppercase">Dashboards</h6>
        <nav class="nav nav-pills text-truncate flex-column">
          <router-link class="nav-link" :to="{name: 'orgSlug-dashboards', params: {orgSlug: orgSlug}}" exact><em>List</em></router-link>
          <router-link class="nav-link" :to="{name: 'orgSlug-dashboards-dashSlug', params: {orgSlug: orgSlug, dashSlug: dashboard.slug}}" :key="dashboard._id" v-for="dashboard in dashboards">{{ dashboard.name }}</router-link>
        </nav>
      </section>

      <section class="px-2 py-2 border-bottom-darken-10">
        <nav class="nav nav-pills text-truncate flex-column">
          <a class="nav-link" href="#"><i class="fa fa-fw fa-sign-in" aria-hidden="true"></i> Login</a>
        </nav>
      </section>

      <section class="px-2 py-2 border-bottom-darken-10" v-if="!organization">
        <nav class="nav nav-pills text-truncate flex-column">
          <a class="nav-link" href="#"><i class="fa fa-fw fa-envelope" aria-hidden="true"></i> Support</a>
          <a class="nav-link" href="#"><i class="fa fa-fw fa-github" aria-hidden="true"></i> GitHub</a>
        </nav>
      </section>
    </div>

    <!-- Main Nav Header -->
    <nav-header class="fixed-top drawer-left-indent" :class="`bg-header-tint-${this.orgTint}`" fa-class="fa-bars" @clicked="toggleMenu">
      <span slot="title" class="h3 py-1 mb-0 ml-3 text-white text-truncate" v-if="orgName">{{ orgName }}</span>
      <img slot="title" class="img-header-logo mx-3" src="~assets/images/Dendra_web_480_120.png" v-else />

      <!-- Units Dropdown -->
      <div class="btn-group" role="group" aria-label="Units dropdown">
        <button id="unitsNavButton" type="button" class="btn btn-dark border-0 dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span class="hidden-sm-down">Units: English</span>
          <span class="hidden-xs-down hidden-md-up">English</span>
          <span class="hidden-sm-up">Eng</span>
        </button>
        <div class="dropdown-menu">
          <a class="dropdown-item" role="button" ><i class="fa fa-check" aria-hidden="true"></i> English</a>
          <a class="dropdown-item" role="button" ><i class="fa fa-check invisible" aria-hidden="true"></i> Metric</a>
        </div>
      </div>
    </nav-header>

    <nuxt class="drawer-left-translate" />

    <email-footer class="drawer-left-translate" />
  </div>
</template>

<script>
import {mapGetters} from 'vuex'

import NavHeader from '../components/NavHeader'
import EmailFooter from '../components/EmailFooter'

export default {
  components: {
    NavHeader,
    EmailFooter
  },

  data () {
    return {
      isMenuOpen: false
    }
  },

  computed: {
    ...mapGetters({
      dashboards: 'dashboards/list',
      organization: 'organizations/current'
    }),

    hasDashboards () {
      return this.dashboards && this.dashboards.length
    },

    orgName () {
      return this.organization && this.organization.name
    },

    orgSlug () {
      return this.organization && this.organization.slug
    },

    orgTint () {
      return 'blue'
    }
  },

  methods: {
    toggleMenu () {
      this.isMenuOpen = !this.isMenuOpen
    }
  },

  watch: {
    '$route': function (newRoute) {
      this.isMenuOpen = false
    }
  }
}
</script>

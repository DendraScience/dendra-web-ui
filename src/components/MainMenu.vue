<template>
  <div class="bg-faded h-100">
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

    <section class="px-2 py-2 border-bottom-darken-10">
      <h6 class="text-muted text-uppercase">Debug</h6>
      <nav class="nav nav-pills text-truncate flex-column">
        <router-link class="nav-link" :to="{name: 'orgSlug-debug-datastreams', params: {orgSlug: orgSlug}}">Datastreams</router-link>
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
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import NavHeader from './NavHeader'

export default {
  components: {
    NavHeader
  },

  computed: {
    ...mapGetters({
      dashboards: 'dashboards/list',
      organization: 'organizations/current'
    }),

    hasDashboards () {
      return this.dashboards && this.dashboards.length
    },

    orgSlug () {
      return this.organization && this.organization.slug
    }
  },

  methods: {
    ...mapMutations({
      toggleMenu: 'toggleMenu'
    })
  }
}
</script>

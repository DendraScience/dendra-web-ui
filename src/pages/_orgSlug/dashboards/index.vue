<template>
  <div class="pt-header pb-4">
    <section class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <h2>Org Dashboards</h2>

          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </div>
      </div>
    </section>

    <section class="container-fluid py-2" v-if="currentOrganization">
      <div class="row">
        <div class="col">
          <div class="list-group">
            <router-link
              class="list-group-item list-group-item-action"
              :to="{name: 'orgSlug-dashboards-dashSlug', params: {orgSlug: currentOrganization.slug, dashSlug: dashboard.slug}}"
              :key="dashboard._id"
              v-for="dashboard in findDashboards().data"
              exact>{{ dashboard.name }}</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  middleware: 'check-org',

  computed: {
    ...mapGetters({
      currentOrganization: 'organizations/current',
      findDashboards: 'dashboards/find'
    })
  }
}
</script>

<template>
  <div class="pt-header pb-4">
    <section class="container-fluid pt-2">
      <div class="row">
        <div class="col-12 py-2">
          <h2>Dashboards</h2>

          <span class="lead">
            Dashboards allow for custom monitoring of individual or multiple stations.
            These are used both for analysis of environmental data and for equipment maintenance and operations monitoring.
          </span>
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

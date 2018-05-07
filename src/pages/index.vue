<template>
  <div class="pt-header">
    <div class="bg-gradient-main">
      <section class="container py-4">
        <div class="row">
          <div class="col-12 col-sm-10 offset-sm-1 text-white text-center">
            <img class="img-fluid mb-4" style="max-height: 90px;" src="~assets/images/Dendra_web_logo_1080_270.png" />

            <h4>Sensor Observatory Curation</h4>

            <p class="body-copy">
              Dendra is a cyberinfrastructure project for real-time sensor data storage, retrieval, management, and curation.
              It is a cloud-based, multi-organizational system, designed to support massive permanent monitoring efforts.
              The name is derived from dendritic networks, such as river networks or tree roots.
              Environmental monitoring performs in a similar manner, pulling data from the earth’s surface to a single location.
            </p>
          </div>
        </div>
      </section>
    </div>

    <div>
      <section class="container py-4">
        <div class="row">
          <div class="col-12 text-center py-2">
            <span class="lead">Data hosted on Dendra</span>
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-md-6 d-flex py-2"
            :key="organization._id"
            v-for="organization in findOrganizations({$sort: {name: 1}}).data">

            <div class="card w-100">
              <div class="card-block">
                <h4 class="card-title">{{ organization.name }}</h4>
                <p class="card-text" v-if="organization.description">{{ organization.description }}</p>
              </div>

              <div class="card-footer text-muted text-truncate">
                <!-- <router-link class="card-link" :to="{name: 'orgSlug', params: {orgSlug: organization.slug}}">Info</router-link> -->

                <!-- TODO: Only show if dashboards exist? -->
                <router-link class="card-link" :to="{name: 'orgSlug-dashboards', params: {orgSlug: organization.slug}}">
                  Dashboards
                </router-link>

                <!-- TODO: Only show if stations exist? -->
                <a class="card-link" :href="`http://${organization.slug}.dendra.science`">
                  Stations
                </a>

                <a class="card-link" :href="organization.url" target="_blank" v-if="organization.url">
                  <i class="fa fa-fw fa-external-link-square" aria-hidden="true"></i> Visit Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div>
      <section class="container py-2">
        <div class="row">
          <div class="col-12 col-md-4 py-2">
            <h4 class="text-uppercase text-success">Community</h4>

            <p class="body-copy">
              Dendra is an open source project.
              All code can be found on <a href="http://github.com/dendrascience" target="_blank">GitHub</a>.
              Please feel free to report any bugs, feature requests, or issues in the <a href="https://github.com/DendraScience/issues/issues" target="_blank">Issues repository</a>.
            </p>

            <p class="body-copy">
              We have a full API for querying and downloading data with <a href="https://dendrascience.github.io/dendra-json-schema/" target="_blank">API documentation available</a>.
            </p>
          </div>

          <div class="col-12 col-md-4 py-2">
            <h4 class="text-uppercase text-warning">Maintenance</h4>

            <p class="body-copy">
              During our rollout, we may need to take Dendra offline for software upgrades and testing.
              Our regularly scheduled maintenance window is from 8&nbsp;PM to 10&nbsp;PM PST daily.
            </p>
          </div>

          <div class="col-12 col-md-4 py-2">
            <h4 class="text-uppercase text-muted">Funding</h4>

            <p class="body-copy">
              This project has been funded in collaboration by the National Science Foundation funded Eel River CZO, State funded UCNRS, and Moore Foundation funded California Heartbeat Initiative.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'

export default {
  middleware: 'no-org',

  fetch ({store}) {
    return store.dispatch('organizations/find', {
      query: {
        slug: {$exists: true},
        $limit: 2000
      }
    })
  },

  computed: {
    ...mapGetters({
      findOrganizations: 'organizations/find'
    }),

    ...mapState([
      'organizations'
    ])
  }
}
</script>

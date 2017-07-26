<template>
  <div class="pt-header pb-4">
    <section class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <h2>Dendra Sensor Network</h2>

          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </div>
      </div>
    </section>

    <section class="container-fluid py-2">
      <div class="row">
        <div class="col-md-4 d-flex py-2" :key="organization._id" v-for="organization in $store.state.organizations">
          <div class="card w-100">
            <div class="card-block">
              <h3 class="card-title">{{ organization.name }}</h3>
              <p class="card-text" v-if="organization.description">{{ organization.description }}</p>
            </div>
            <div class="card-footer text-muted text-truncate">
              <router-link class="card-link" :to="{name: 'orgSlug', params: {orgSlug: organization._id}}">Info</router-link>
              <!-- TODO: Only show if dashboards exist? -->
              <router-link class="card-link" :to="{name: 'orgSlug-dashboards', params: {orgSlug: organization._id}}">Dashboards</router-link>
              <!-- TODO: Only show if stations exist? -->
              <router-link class="card-link" :to="{name: 'orgSlug-stations', params: {orgSlug: organization._id}}">Stations</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  middleware: 'no-org',

  fetch ({app, error, store}) {
    // TODO: Include only enabled organizations with slugs
    return app.$services.organization.find({
      query: {
        $sort: {name: 1}
      }
    }).then(res => {
      if (res && res.data) {
        store.dispatch('setOrganizations', res.data)
      } else {
        store.dispatch('clearOrganizations')
      }
    }).catch(e => {
      store.dispatch('clearOrganizations')

      error({
        statusCode: e.statusCode || 500,
        message: e.message
      })
    })
  }
}
</script>

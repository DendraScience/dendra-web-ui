<template>
  <div class="pt-header pb-4">
    <section class="container-fluid py-4" v-if="currentOrganization">
      <div class="row">
        <div class="col-12">
          <p class="lead" v-if="currentOrganization.description">{{ currentOrganization.description }}</p>
          <p class="lead" v-else>No description.</p>
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
      currentOrganization: 'organizations/current'
    })
  }
}
</script>

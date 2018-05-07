<template>
  <div class="pt-header pb-4">
    <section class="container-fluid pt-2" v-if="currentOrganization">
      <div class="row">
        <div class="col-12">
          <span class="lead" v-if="currentOrganization.description">{{ currentOrganization.description }}</span>
          <span class="lead" v-else>No description.</span>
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

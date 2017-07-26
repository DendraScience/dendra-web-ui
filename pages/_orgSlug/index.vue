<template>
  <div class="pt-header pb-4">
    <section class="container-fluid py-4" v-if="current">
      <div class="row">
        <div class="col-12">
          <p class="lead" v-if="current.description">{{ current.description }}</p>
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
      current: 'organization/current'
    })
  }
}
</script>

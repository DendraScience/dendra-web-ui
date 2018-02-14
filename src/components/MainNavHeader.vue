<template>
  <nav-header class="fixed-top" :class="`bg-header-tint-${this.orgTint}`" fa-class="fa-bars" @clicked="toggleMenu">
    <span slot="title" class="h3 py-1 mb-0 ml-3 text-white text-truncate" v-if="orgName">{{ orgName }}</span>
    <img slot="title" class="img-header-logo mx-3" src="~assets/images/Dendra_web_480_120.png" v-else />

    <!-- Units Dropdown -->
    <!-- TODO: Implement this! -->
<!--
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
 -->
  </nav-header>
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
      organization: 'organizations/current'
    }),

    orgName () {
      return this.organization && this.organization.name
    },

    orgTint () {
      return 'blue'
    }
  },

  methods: {
    ...mapMutations({
      toggleMenu: 'toggleMenu'
    })
  }
}
</script>

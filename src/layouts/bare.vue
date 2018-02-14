<template>
  <div :class="isMenuOpen ? 'drawer-left-open' : ''">
    <main-menu class="drawer-left drawer-left-shadow-inset" />
    <main-nav-header class="drawer-left-indent" />
    <nuxt class="drawer-left-translate" />
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import MainMenu from '../components/MainMenu'
import MainNavHeader from '../components/MainNavHeader'
import EmailFooter from '../components/EmailFooter'

export default {
  components: {
    MainMenu,
    MainNavHeader,
    EmailFooter
  },

  computed: {
    ...mapGetters({
      isMenuOpen: 'isMenuOpen'
    })
  },

  methods: {
    ...mapMutations({
      setIsMenuOpen: 'setIsMenuOpen'
    })
  },

  watch: {
    '$route': function (newRoute) {
      this.setIsMenuOpen(false)
    }
  }
}
</script>

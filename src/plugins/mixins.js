import Vue from 'vue'

Vue.mixin({
  computed: {
    $can() {
      return (...args) => {
        return this.$store.getters.abilityUpdated > 0
          ? this.$ability.can(...args)
          : false
      }
    },

    $cannot() {
      return (...args) => {
        return this.$store.getters.abilityUpdated > 0
          ? this.$ability.cannot(...args)
          : true
      }
    }
  }
})

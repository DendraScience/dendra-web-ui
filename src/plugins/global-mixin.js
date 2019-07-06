import Vue from 'vue'

// TODO: Use inject instead?
Vue.mixin({
  computed: {
    $can() {
      return (...args) => {
        return this.$store.getters.abilityUpdateTime > 0
          ? this.$ability.can(...args)
          : false
      }
    },

    $cannot() {
      return (...args) => {
        return this.$store.getters.abilityUpdateTime > 0
          ? this.$ability.cannot(...args)
          : true
      }
    }
  }
})

export default {
  data: () => ({
    accessLevel: {
      dialog: false
    }
  }),

  methods: {
    addAccessLevel({ key, target }) {
      this.accessLevel = {
        dialog: true,
        key,
        level: 1,
        target
      }

      requestAnimationFrame(() => {
        this.$refs.accessLevelDialog.$refs.observer.reset()
      })
    },

    editAccessLevel({ key, target }) {
      this.accessLevel = {
        dialog: true,
        key,
        level: this.value.access_levels[key],
        target
      }

      requestAnimationFrame(() => {
        this.$refs.accessLevelDialog.$refs.observer.reset()
      })
    },

    commitAccessLevel({ key, level }) {
      const { value } = this

      const newLevels = Object.assign({}, value.access_levels, {
        [key]: level
      })

      value.access_levels = newLevels

      this.accessLevel.dialog = false
    },

    removeAccessLevel({ key }) {
      const { value } = this

      const newLevels = Object.assign({}, value.access_levels)
      delete newLevels[key]

      value.access_levels = newLevels

      this.accessLevel.dialog = false
    }
  }
}

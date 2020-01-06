// import _get from 'lodash/get'
// import { jsonFormat } from '@/lib/utils'

export default {
  data: () => ({
    generalConfig: {
      dialog: false
    }
  }),

  computed: {
    configSettingsResolved() {
      const { generalConfig: value } = this
      const resolved = { data: null, valid: true }

      try {
        resolved.data = JSON.parse(value.settings)
      } catch (err) {
        resolved.error = `Parse error: ${err.message}.`
        resolved.valid = false
      }

      return resolved
    }
  },

  methods: {
    addGeneralConfig() {
      this.generalConfig = {
        dialog: true,
        settings: '{}'
      }

      requestAnimationFrame(() => {
        this.$refs.generalConfigDialog.$refs.observer.reset()
      })
    },

    editGeneralConfig(item) {
      this.generalConfig = {
        dialog: true,
        settings: item.settings
      }

      requestAnimationFrame(() => {
        this.$refs.generalConfigDialog.$refs.observer.reset()
      })
    },

    commitGeneralConfig() {
      const { configSettingsResolved: settingsResolved, value } = this

      value.general_config = settingsResolved.data

      this.generalConfig.dialog = false
    },

    removeGeneralConfig() {
      this.value.general_config = null
    }
  }
}

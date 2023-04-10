export default {
  data: () => ({
    externalReference: {
      dialog: false
    }
  }),

  computed: {
    externalRefTypeResolved() {
      const {
        externalReference: { selectedType, type },
        value
      } = this
      const resolved = { data: null, valid: true }

      const isRepet =
        value &&
        value.external_refs &&
        value.external_refs.find(item => item.type === type)
      resolved.data = type

      if (
        (isRepet !== undefined && !selectedType) ||
        (selectedType !== type && isRepet !== undefined)
      ) {
        resolved.error = 'duplicate external reference type'
        resolved.valid = false
      }

      return resolved
    }
  },

  methods: {
    addExternalReference() {
      this.externalReference = {
        dialog: true,
        identifier: null,
        selectedType: null,
        type: null,
        url: null
      }

      requestAnimationFrame(() => {
        this.$refs.externalRefDialog.$refs.observer.reset()
      })
    },

    editExternalReference(item) {
      this.externalReference = Object.assign(
        { dialog: true, selectedType: item.type },
        item
      )

      requestAnimationFrame(() => {
        this.$refs.externalRefDialog.$refs.observer.reset()
      })
    },

    commitExternalReference({ identifier, key, type, url }) {
      const { value } = this
      const data = { identifier, type, ...(url && url !== '' && { url }) }

      if (key === undefined) {
        value.external_refs.push(data)
      } else {
        value.external_refs = value.external_refs.map((item, index) => {
          return index === key ? data : item
        })
      }

      this.externalReference.dialog = false
    },

    removeExternalReference({ key }) {
      this.value.external_refs = this.value.external_refs.filter(
        (_interval, index) => index !== key
      )
    }
  }
}

export default {
  data: () => ({
    terms: {
      dialog: false
    }
  }),

  methods: {
    addTerms({ key }) {
      this.terms = {
        dialog: true,
        key,
        pairs: {}
      }

      requestAnimationFrame(() => {
        this.$refs.termsDialog.$refs.observer.reset()
      })
    },

    editTerms({ key }) {
      const pairs = Object.assign({}, this.value.terms[key])

      this.terms = {
        dialog: true,
        key,
        pairs
      }

      requestAnimationFrame(() => {
        this.$refs.termsDialog.$refs.observer.reset()
      })
    },

    commitTerms({ key, pairs }) {
      const { value } = this

      const cleanPairs = {}
      Object.keys(pairs).forEach(key => {
        const val = pairs[key]
        if (val !== null && val !== '') cleanPairs[key] = val
      })

      if (Object.keys(cleanPairs).length)
        this.$set(value.terms, key, cleanPairs)
      else this.$delete(value.terms, key)

      this.terms.dialog = false
    },

    removeTerms({ key }) {
      this.$delete(this.value.terms, key)
    }
  }
}

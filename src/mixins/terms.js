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

      if (Object.keys(pairs).length) this.$set(value.terms, key, pairs)
      else this.$delete(value.terms, key)

      this.terms.dialog = false
    },

    removeTerms({ key }) {
      this.$delete(this.value.terms, key)
    }
  }
}

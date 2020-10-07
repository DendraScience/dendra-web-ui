export default {
  data: () => ({
    externalLink: {
      dialog: false
    }
  }),

  methods: {
    addExternalLink() {
      this.externalLink = {
        dialog: true,
        title: null,
        url: null
      }

      requestAnimationFrame(() => {
        this.$refs.externalLinkDialog.$refs.observer.reset()
      })
    },

    editExternalLink(item) {
      this.externalLink = Object.assign({ dialog: true }, item)

      requestAnimationFrame(() => {
        this.$refs.externalLinkDialog.$refs.observer.reset()
      })
    },

    commitExternalLink({ key, title, url }) {
      const { value } = this

      if (key === undefined) {
        value.external_links.push({
          title,
          url
        })
      } else {
        value.external_links = value.external_links.map((item, index) => {
          return index === key
            ? {
                title,
                url
              }
            : item
        })
      }

      this.externalLink.dialog = false
    },

    removeExternalLink({ key }) {
      this.value.external_links = this.value.external_links.filter(
        (interval, index) => index !== key
      )
    }
  }
}

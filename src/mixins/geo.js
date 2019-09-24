export default {
  methods: {
    addGeoPoint() {
      this.value.geo = {
        type: 'Point'
      }
    },

    removeGeo() {
      this.value.geo = null
    }
  }
}

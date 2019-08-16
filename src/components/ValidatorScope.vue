<script>
export default {
  $_veeValidate: {
    validator: 'new'
  },

  render() {
    return this.$scopedSlots.default({
      validator: this.$validator
    })
  }
}
</script>

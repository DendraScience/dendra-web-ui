export default {
  methods: {
    add(item) {
      this.$emit('add', item)
    },

    edit(item) {
      this.$emit('edit', item)
    },

    remove(item) {
      this.$emit('remove', item)
    }
  }
}

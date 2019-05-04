<template>
  <v-flex v-if="url">
    <v-img :src="url" />
  </v-flex>
</template>

<script>
export default {
  props: {
    media: { default: null, type: Array }
  },

  computed: {
    url() {
      const photo =
        this.media && this.media.find(media => media.type === 'photo')
      return photo && photo.sizes.medium.url
    }
  }
}
</script>

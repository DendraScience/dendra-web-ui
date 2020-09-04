<template>
  <v-card>
    <v-container fluid>
      <v-row v-if="!!this.$scopedSlots.default" dense>
        <v-col class="headline">
          <slot>Images</slot>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="(item, index) in slicedItems"
          :key="index"
          cols="12"
          sm="6"
          md="3"
        >
          <v-img :src="item.url" contain max-height="320" />
        </v-col>
      </v-row>
    </v-container>

    <v-card-actions v-if="hasMore">
      <v-btn @click="isAllShown = true">Show All</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    items: { type: Array, required: true }
  },

  data() {
    return {
      isAllShown: false
    }
  },

  computed: {
    hasMore() {
      return this.items.length > this.slicedItems.length
    },

    slicedItems() {
      const { isAllShown, items } = this
      return isAllShown ? items : items.slice(0, 4)
    }
  }
}
</script>

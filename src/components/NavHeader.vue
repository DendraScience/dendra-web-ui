<template>
  <header class="container-fluid h-header p-0">
    <div class="d-flex flex-row justify-content-start align-items-center h-100">
      <!-- Nav Group: Left -->
      <div class="d-flex flex-row justify-content-center align-items-center h-100 px-3 x-bg-darken-20">
        <a class="px-1 text-white hidden-sm-down menu-link" @click.prevent="clicked"><i class="fa fa-fw fa-2x" :class="faClass" aria-hidden="true"></i></a>
        <a class="px-1 text-white hidden-md-up menu-link" @click.prevent="clicked"><i class="fa fa-fw fa-lg" :class="faClass" aria-hidden="true"></i></a>
      </div>

      <!-- Title Slot -->
      <slot name="title" />

      <!-- Nav Group: Right -->
      <div class="d-flex flex-row justify-content-center align-items-center h-100 px-3 ml-auto">
        <slot />
      </div>
    </div>
  </header>
</template>

<script>
export default {
  props: {
    faClass: String
  },

  methods: {
    clicked () {
      this.$emit('clicked', 0)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.menu-link {
  cursor: pointer;
  text-decoration: none;
}
</style>

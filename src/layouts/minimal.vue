<template>
  <v-app>
    <v-app-bar app color="grey darken-4" dark fixed height="64">
      <v-toolbar-title>
        <nuxt-link to="/" class="text-decoration-none white--text" exact>
          Dendra.Science</nuxt-link
        >
      </v-toolbar-title>
    </v-app-bar>

    <v-main app>
      <div>
        <nuxt />
      </div>
    </v-main>
  </v-app>
</template>

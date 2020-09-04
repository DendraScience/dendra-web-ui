<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <h2 class="headline">
          <slot>Headline</slot>
        </h2>
      </v-col>
    </v-row>

    <slot name="content" />
  </v-container>
</template>

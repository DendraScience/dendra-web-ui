<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light mb-2">Contact</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn text :href="`mailto:${email}`"
          ><v-icon left>{{ mdiEmail }}</v-icon
          >{{ email }}</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ['no-org'],

  data: () => ({
    email: 'metahuman@dendra.science'
  })
}
</script>

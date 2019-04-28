<template>
  <v-layout column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout row wrap>
          <v-flex xs12>
            <h3 class="display-2 mb-2">Contact</h3>

            <v-btn flat :href="`mailto:${email}`"
              ><v-icon left>email</v-icon>{{ email }}</v-btn
            >
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      email: 'collin@berkeley.edu'
    }
  }
}
</script>

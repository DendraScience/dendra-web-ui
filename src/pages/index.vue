<template>
  <v-layout justify-start column style="height: calc(100vh - 64px);">
    <v-flex class="bg-image">
      <v-container fill-height>
        <v-layout justify-end column>
          <v-flex shrink pb-2 pt-4>
            <dendra-logo width="100%" style="max-width: 460px;" />
          </v-flex>

          <v-flex shrink pb-4>
            <h4 class="display-1 white--text">
              Sensor Observatory Curation
            </h4>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-flex green darken-2 shrink>
      <v-container grid-list-sm>
        <v-layout column>
          <v-flex xs12 subheading white--text>
            Dendra is a cyberinfrastructure project for real-time sensor data
            storage, retrieval, management, and curation. It is a cloud-based,
            multi-organizational system, designed to support massive permanent
            monitoring efforts. The name is derived from dendritic networks,
            such as river networks or tree roots. Environmental monitoring
            performs in a similar manner, pulling data from the earth’s surface
            to a single location.
          </v-flex>

          <v-flex ml-auto subheading white--text>
            Hosted on
            <a href="https://www.xsede.org/" target="_blank">
              <v-img width="100" :src="require('@/assets/xsede-logo.png')" />
            </a>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-flex grey darken-2 shrink>
      <v-container>
        <v-layout justify-center row wrap>
          <v-flex xs12 text-xs-center white--text>
            <v-btn color="white" flat round to="/orgs">Orgs</v-btn>
            <v-btn color="white" flat round to="/about">About</v-btn>
            <v-btn color="white" flat round to="/contact">Contact</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import DendraLogo from '@/components/DendraLogo.vue'

export default {
  components: {
    DendraLogo
  },

  middleware: ['no-org']
}
</script>

<style lang="stylus" scoped>
.bg-image
  background-repeat: no-repeat
  background-size: cover
  background-image: url('~assets/angelo-reserve.jpg')
  background-position: top center
</style>

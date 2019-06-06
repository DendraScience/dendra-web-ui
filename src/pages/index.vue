<template>
  <v-layout column style="height: calc(100vh - 64px);">
    <v-flex class="bg-image">
      <v-container>
        <v-layout column>
          <v-flex mt-4 mb-2>
            <img
              style="max-width: 460px; width: 100%;"
              src="@/assets/dendra-logo.svg"
            />
          </v-flex>

          <v-flex mb-4>
            <h4 class="display-1 white--text">
              Sensor Observatory Curation
            </h4>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-flex green darken-1 shrink>
      <v-container grid-list-sm>
        <v-layout column>
          <v-flex subheading white--text>
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

    <v-flex shrink>
      <v-container grid-list-xl>
        <v-layout row wrap>
          <v-flex xs12 md4>
            <h4 class="display-1 mb-2">Community</h4>

            <p class="subheading">
              Dendra is an open source project. All code can be found on
              <a href="http://github.com/dendrascience" target="_blank"
                >GitHub</a
              >. Please feel free to report any bugs, feature requests, or
              issues in the
              <a
                href="https://github.com/DendraScience/issues/issues"
                target="_blank"
                >Issues repository</a
              >.
            </p>

            <p class="subheading">
              We have a full API for querying and downloading data with
              <a
                href="https://dendrascience.github.io/dendra-json-schema/"
                target="_blank"
                >API documentation available</a
              >.
            </p>
          </v-flex>

          <v-flex xs12 md4>
            <h4 class="display-1 mb-2">Maintenance</h4>

            <p class="subheading">
              During our rollout, we may need to take Dendra offline for
              software upgrades and testing. Our regularly scheduled maintenance
              window is from 8 PM to 10 PM PST daily.
            </p>
          </v-flex>

          <v-flex xs12 md4>
            <h4 class="display-1 mb-2">Funding</h4>

            <p class="subheading">
              This project has been funded in collaboration by the National
              Science Foundation funded Eel River CZO, State funded UCNRS, and
              Moore Foundation funded California Heartbeat Initiative.
            </p>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-flex grey lighten-2 shrink>
      <v-container>
        <v-layout row wrap>
          <v-flex xs12 text-xs-center>
            <v-btn flat round to="/orgs">Organizations</v-btn>
            <v-btn flat round to="/contact">Contact</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
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

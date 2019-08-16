<template>
  <v-layout column style="min-height: calc(100vh - 64px);">
    <v-flex class="bg-image">
      <v-container>
        <v-layout column>
          <v-flex mt-6>
            <img
              style="max-width: 460px; width: 100%;"
              src="@/assets/dendra-logo.svg"
            />
          </v-flex>

          <v-flex mb-6>
            <h4 class="display-1 white--text">
              Sensor Observatory Curation
            </h4>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-flex secondary shrink>
      <v-container>
        <v-layout column>
          <v-flex subtitle-1 white--text>
            Dendra is a cyberinfrastructure project for real-time sensor data
            storage, retrieval, management, and curation. It is a cloud-based,
            multi-organizational system, designed to support massive permanent
            monitoring efforts. The name is derived from dendritic networks,
            such as river networks or tree roots. Environmental monitoring
            performs in a similar manner, pulling data from the earth’s surface
            to a single location.
          </v-flex>

          <v-flex caption ml-auto white--text>
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
        <v-layout wrap py-2>
          <v-flex xs12 md4>
            <h5 class="headline mb-2">Community</h5>

            <p>
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

            <p>
              We have a full API for querying and downloading data with
              <a
                href="https://dendrascience.github.io/dendra-json-schema/"
                target="_blank"
                >API documentation available</a
              >.
            </p>
          </v-flex>

          <v-flex xs12 md4>
            <h5 class="headline mb-2">Maintenance</h5>

            <p>
              During our rollout, we may need to take Dendra offline for
              software upgrades and testing. Our regularly scheduled maintenance
              window is from 8 PM to 10 PM PST daily.
            </p>
          </v-flex>

          <v-flex xs12 md4>
            <h5 class="headline mb-2">Funding</h5>

            <p>
              This project has been funded in collaboration by the National
              Science Foundation funded Eel River CZO, State funded UCNRS, and
              Moore Foundation funded California Heartbeat Initiative.
            </p>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-flex grey lighten-2 shrink pb-4>
      <v-container grid-list-xl>
        <v-layout>
          <v-flex text-center
            ><h6 class="title">Organizations on Dendra</h6></v-flex
          >
        </v-layout>

        <feathers-vuex-find
          v-slot="{ items: organizations }"
          :query="{ is_enabled: true, $sort: { sort_value: 1, name: 1 } }"
          service="organizations"
        >
          <v-layout justify-center wrap>
            <v-flex
              v-for="organization in organizations"
              :key="organization._id"
              shrink
            >
              <v-btn
                rounded
                tile
                :to="{
                  name: 'orgs-orgSlug',
                  params: { orgSlug: organization.slug }
                }"
                >{{ organization.name }}</v-btn
              >
            </v-flex>
          </v-layout>
        </feathers-vuex-find>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  middleware: ['no-org']
}
</script>

<style scoped>
.bg-image {
  background-repeat: no-repeat;
  background-size: cover;
  background-image: url('~assets/angelo-reserve.jpg');
  background-position: top center;
}
</style>

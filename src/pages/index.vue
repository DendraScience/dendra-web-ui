<template>
  <v-container fluid pa-0>
    <v-row no-gutters>
      <v-col>
        <v-img
          :src="require('@/assets/angelo-reserve.jpg')"
          gradient="to top right, rgba(0, 0, 0, .1), rgba(0, 0, 0, .1)"
          max-height="300"
          position="top"
        >
          <v-container>
            <v-row>
              <v-col>
                <v-img
                  :src="require('@/assets/dendra-logo.svg')"
                  aspect-ratio="4"
                  max-width="460"
                  width="100%"
                />
              </v-col>
            </v-row>

            <v-row dense>
              <v-col>
                <h4 class="display-1 white--text">
                  Sensor Observatory Curation
                </h4>
              </v-col>
            </v-row>
          </v-container>
        </v-img>

        <v-row class="green" dense>
          <v-col>
            <v-container>
              <v-row dense>
                <v-col class="subtitle-1 white--text" cols="12">
                  Dendra is a cyberinfrastructure project for real-time sensor
                  data storage, retrieval, management, and curation. It is a
                  cloud-based, multi-organizational system, designed to support
                  massive permanent monitoring efforts. The name is derived from
                  dendritic networks, such as river networks or tree roots.
                  Environmental monitoring performs in a similar manner, pulling
                  data from the earth’s surface to a single location.
                </v-col>
              </v-row>

              <v-row dense>
                <v-col class="caption white--text ml-auto" cols="auto">
                  Hosted on
                  <a href="https://www.xsede.org/" target="_blank">
                    <v-img
                      width="100"
                      :src="require('@/assets/xsede-logo.png')"
                    />
                  </a>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col>
            <v-container>
              <v-row>
                <v-col cols="12" md="4">
                  <h5 class="headline mb-2">Community</h5>

                  <p class="body-2">
                    Dendra is an open source project. All code can be found on
                    <a href="https://github.com/DendraScience" target="_blank"
                      >GitHub</a
                    >. Please feel free to report any bugs, feature requests, or
                    issues in the
                    <a
                      href="https://github.com/DendraScience/issues/issues"
                      target="_blank"
                      >Issues repository</a
                    >.
                  </p>

                  <p class="body-2">
                    We have a full API for querying and downloading data with
                    <a
                      href="https://dendrascience.github.io/dendra-json-schema/"
                      target="_blank"
                      >API documentation available</a
                    >.
                  </p>
                </v-col>

                <v-col cols="12" md="4">
                  <h5 class="headline mb-2">Maintenance</h5>

                  <p class="body-2">
                    During our rollout, we may need to take Dendra offline for
                    software upgrades and testing. Our regularly scheduled
                    maintenance window is from 8 PM to 10 PM PST daily.
                  </p>
                </v-col>

                <v-col cols="12" md="4">
                  <h5 class="headline mb-2">Funding</h5>

                  <p class="body-2">
                    This project has been funded in collaboration by the
                    National Science Foundation funded Eel River CZO, State
                    funded UCNRS, and Moore Foundation funded California
                    Heartbeat Initiative.
                  </p>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>

        <v-divider />

        <v-row dense>
          <v-col>
            <v-container>
              <v-row>
                <v-col><h5 class="headline">Organizations on Dendra</h5></v-col>
              </v-row>

              <feathers-vuex-find
                v-slot="{ items: organizations }"
                :query="{ is_enabled: true, $sort: { sort_value: 1, name: 1 } }"
                service="organizations"
              >
                <v-row>
                  <v-col
                    v-for="organization in organizations"
                    :key="organization._id"
                    cols="auto"
                  >
                    <v-btn
                      :to="{
                        name: 'orgs-orgSlug',
                        params: { orgSlug: organization.slug }
                      }"
                      >{{ organization.name }}</v-btn
                    >
                  </v-col>
                </v-row>
              </feathers-vuex-find>
            </v-container>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ['no-org']
}
</script>

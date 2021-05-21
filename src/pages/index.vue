<template>
  <div>
    <v-container fluid pa-0 style="margin-top: -64px">
      <v-row no-gutters>
        <v-col>
          <v-img
            :max-height="$vuetify.breakpoint.smAndUp ? 460 : undefined"
            :src="require('@/assets/angelo-reserve.jpg')"
            aspect-ratio="1.5"
            class="fill-height d-flex align-end"
            gradient="to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.1)"
            position="top"
          >
            <v-container class="pa-md-6" style="margin-top: 64px">
              <v-row>
                <v-col class="subtitle-1 white--text" cols="12" md="8">
                  <v-img
                    :max-width="$vuetify.breakpoint.mdAndUp ? 380 : 260"
                    :src="require('@/assets/dendra-logo.svg')"
                    aspect-ratio="4"
                    width="100%"
                  />

                  <h4 class="text-h5 text-md-h4 white--text my-3">
                    Sensor Observatory Curation
                  </h4>

                  <div class="text-body-2 text-md-body-1">
                    Dendra is a cyberinfrastructure project for real-time sensor
                    data storage, retrieval, management, and curation. It is a
                    cloud-based, multi-organizational system, designed to
                    support massive permanent monitoring efforts. The name is
                    derived from dendritic networks, such as river networks or
                    tree roots. Environmental monitoring performs in a similar
                    manner, pulling data from the earth’s surface to a
                    single&nbsp;location.
                  </div>
                </v-col>

                <v-col class="d-flex align-end justify-end">
                  <div>
                    <span class="caption white--text">Hosted on</span>
                    <a href="https://www.xsede.org/" target="_blank">
                      <v-img
                        width="100"
                        :src="require('@/assets/xsede-logo.png')"
                      />
                    </a>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-img>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="grey lighten-4" fluid pa-0>
      <v-row no-gutters>
        <v-col>
          <v-container class="pa-md-6">
            <v-row>
              <v-col cols="12" md="4">
                <h5 class="headline mb-2">Community</h5>

                <p class="body-1">
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

                <p class="body-1">
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

                <p class="body-1">
                  During our rollout, we may need to take Dendra offline for
                  software upgrades and testing. Our regularly scheduled
                  maintenance window is from 8 PM to 10 PM PST daily.
                </p>
              </v-col>

              <v-col cols="12" md="4">
                <h5 class="headline mb-2">Funding</h5>

                <p class="body-1">
                  This project has been funded in collaboration by the National
                  Science Foundation funded Eel River CZO, State funded UCNRS,
                  and Gordon and Betty Moore Foundation funded California
                  Heartbeat Initiative.
                </p>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>

    <v-container fluid pa-0>
      <v-row no-gutters>
        <v-col>
          <v-container class="pa-md-6">
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
                    ><span
                      class="d-inline-block text-truncate"
                      style="max-width: 260px"
                      >{{ organization.name }}</span
                    ></v-btn
                  >
                </v-col>
              </v-row>
            </feathers-vuex-find>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  middleware: ['no-org']
}
</script>

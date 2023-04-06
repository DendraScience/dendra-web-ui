<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light my-2">About</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h3 class="headline mb-2">What We Do</h3>
        <p class="body-1 mb-0">
          Dendra is a cyberinfrastructure project for real-time sensor data
          storage, retrieval, management and curation. It is a cloud-based,
          multi-organizational system, designed to support massive permanent
          monitoring efforts. We merge the QA/QC process with field maintenance
          and system status alerting in a way which makes it easier to keep on
          top of issues that crop up with the data.
        </p>
      </v-col>

      <v-col cols="12" md="3">
        <h4 class="title">How to Contact</h4>
        <p class="body-2">
          We love getting feedback! If you have any questions, please email us
          at
          <a :href="`mailto:${infoEmail}?subject=Question`">{{ infoEmail }}</a
          >.
        </p>

        <h5 class="subtitle-1">Slack</h5>
        <p class="body-2">
          We have a <a :href="slackURL" target="_blank">Slack channel</a> for
          day-to-day operations, issues and questions.
        </p>
      </v-col>

      <v-col cols="12" md="3">
        <h4 class="title">Flexibility</h4>
        <p class="body-2">
          We are agnostic to datalogger and sensor type, as long as they produce
          a measurement with a timestamp.
        </p>
        <p class="body-2">
          Also, while our backend primarily uses
          <a href="https://www.influxdata.com/" target="_blank">InfluxDB</a> for
          storage and retrieval, we can access data stored in other existing
          databases. Ingestion of data can be from static CSV files on a shared
          drive, realtime MQTT messaging, or
          <a href="https://www.campbellsci.com/" target="_blank"
            >Campbell Scientific</a
          >
          LDMP XML.
        </p>
      </v-col>

      <v-col cols="12" md="3">
        <h4 class="title">Do you want to join?</h4>
        <p class="body-2">
          Dendra is supported by inclusion in grants and by hourly recharge. If
          you are interested in having your organization’s monitoring hosted on
          Dendra, please
          <a :href="`mailto:${infoEmail}?subject=Question`">contact us</a>.
        </p>
      </v-col>

      <v-col cols="12" md="3">
        <h4 class="title">Poster</h4>
        <p class="body-2">
          Please see our
          <a
            href="https://essopenarchive.org/doi/full/10.1002/essoar.10501341.1"
            target="_"
            >American Geophysical Union poster</a
          >
          for details on how the system operates.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h3 class="headline mb-2">Who We Are</h3>
        <p class="body-1 mb-0">
          Dendra is operated by a small team, consisting of Collin and Scott
          working closely with the curators from each
          <nuxt-link to="/orgs">organization</nuxt-link>.
        </p>
      </v-col>

      <v-col cols="12">
        <v-card color="grey lighten-4" flat>
          <v-container fluid>
            <v-row>
              <v-col cols="12" md="3">
                <v-row class="align-start justify-center">
                  <v-col class="flex-grow-0 flex-shrink-1">
                    <v-avatar ref="avatar" size="140">
                      <img
                        :src="
                          require(`@/assets/dendra/collin-with-brick-wall-smiling-2019.jpg`)
                        "
                      />
                    </v-avatar>
                  </v-col>
                </v-row>

                <v-row class="align-start justify-center">
                  <v-col>
                    <h5 class="subtitle-2 text-center">Collin Bode</h5>
                  </v-col>
                </v-row>
              </v-col>

              <v-col class="d-flex align-center" cols="12" md="9">
                <div class="body-2">
                  I spent most of my career performing watershed research with
                  multidisciplinary groups. With a degree from the Energy &
                  Resources Group (ERG), UC Berkeley, I have worked extensively
                  with GIS analysis and modeling including with airborne LiDAR.
                  In recent years, my work has shifted to informatics and
                  environmental monitoring, with a focus on trying to bridge the
                  gap between scientists and engineers. An avid hiker and rock
                  climber, I enjoy being out in the field, especially when that
                  requires climbing redwoods.
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card color="grey lighten-4" flat>
          <v-container fluid>
            <v-row>
              <v-col cols="12" md="3">
                <v-row class="align-start justify-center">
                  <v-col class="flex-grow-0 flex-shrink-1">
                    <v-avatar ref="avatar" size="140">
                      <img
                        :src="
                          require(`@/assets/dendra/scott-in-presidio-3-2022.jpg`)
                        "
                      />
                    </v-avatar>
                  </v-col>
                </v-row>

                <v-row class="align-start justify-center">
                  <v-col>
                    <h5 class="subtitle-2 text-center">J. Scott Smith</h5>
                  </v-col>
                </v-row>
              </v-col>

              <v-col class="d-flex align-center" cols="12" md="9">
                <div class="body-2">
                  I have a diverse background in “full stack” software
                  architecture, coding and enterprise solutions. My experience
                  ranges from enterprise data systems to mobile devices; and
                  includes proficiency in IoT hardware and firmware development.
                  Originally from the Midwest, I got my start programming in ’79
                  — and while in school taught computer programming classes, and
                  also interned with the federal government. My enterprise work
                  experience ranges from tech startups, to F100, F500 and F1000
                  companies. Other passions include vegan cooking, martial arts,
                  and electronic music creation.
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ['no-org']
}
</script>

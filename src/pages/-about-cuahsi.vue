<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light my-2">About</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h3 class="headline mb-2">Hydrologic Information System (HIS)</h3>
        <p class="body-1 mb-2">
          CUAHSI’s Hydrologic Information System provides a solution for
          discovering, accessing, and publishing time-series and sensor data.
          Data published to the HIS are accessible through the discovery portal,
          HydroClient (data.cuahsi.org). HydroClient provides access to over 100
          data sources, including over 5 million unique time series, from
          federal agencies, university researchers, and volunteer science groups
          through a single map interface. All data are returned in the same
          format, reducing the time required to find and reformat the data. Use
          HydroClient to search for, preview, and download time series data like
          stream gauge measurements, meteorological station measurements,
          repeated “grab” samples, and soil moisture measurements.
        </p>
        <v-img :src="require('@/assets/cuahsi/HISDiagram.png')" width="100%" />
        <p class="body-1 mb-2">
          The HIS is a cyberinfrastructure project for real-time sensor data
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
          HIS is supported by inclusion in grants and by hourly recharge. If
          interested in having your organization’s monitoring hosted on HIS,
          HIS, please
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
  </v-container>
</template>

<script>
export default {
  middleware: ['no-org']
}
</script>

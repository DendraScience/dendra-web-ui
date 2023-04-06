<template>
  <v-card tile>
    <content-header>
      Download data
      <template #content>
        <v-row>
          <v-col class="body-1" cols="12" md="6">
            <p>
              Dendra provides two ways to download data. If you are
              <nuxt-link to="/login">logged in</nuxt-link>, then you may create
              a bulk download that is generated in the cloud. Otherwise you can
              export data from a chart as follows:
            </p>

            <ol>
              <li>
                Go back to the previous tab,
                <strong>Chart</strong>.
              </li>
              <li>
                If you haven’t already, please set your target time period and
                graph all the datastreams that you would like to download.
              </li>
              <li>
                Once the graph is complete, there will be a menu in the top
                right corner of the plot represented by three vertical dots
                (<v-icon>{{ mdiDotsVertical }}</v-icon
                >).
              </li>
              <li>
                Select from the menu,
                <strong>Export as…</strong> (see image)
              </li>
              <li>
                Choose <strong>CSV file</strong> (other options will save the
                plot as an image).
              </li>
              <li>Click <strong>Export</strong>.</li>
              <li>
                Your data will be saved under the title of the graph, e.g.
                <code>data-i-want-to-download.csv</code>.
              </li>
            </ol>
          </v-col>

          <v-col cols="12" md="6">
            <!-- TODO: DRC Check if this shared asset works for all presentations -->
            <v-img :src="require('@/assets/download-data-from-graph.jpg')" />
          </v-col>
        </v-row>
      </template>
    </content-header>
  </v-card>
</template>

<script>
import ContentHeader from '@/components/ContentHeader'

export default {
  components: {
    ContentHeader
  }
}
</script>

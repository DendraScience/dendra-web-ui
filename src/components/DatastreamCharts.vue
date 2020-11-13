<template>
  <v-container fluid>
    <v-row v-for="(chart, index) in value" :key="chart.id">
      <v-col cols="12">
        <datastream-chart
          :value="chart"
          :hide-legend.sync="hideLegend"
          :pin-tooltip.sync="pinTooltip"
          :show-controls="showControls"
          :worker="Object.freeze(worker)"
        >
          <template v-slot:menu>
            <v-list>
              <v-list-item v-if="showRemove" @click="remove(index)">
                <v-list-item-title>Remove</v-list-item-title>
              </v-list-item>

              <v-list-item
                :disabled="!chart.isReady"
                @click="showExportDialog(chart)"
              >
                <v-list-item-title>Export as...</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="previousExportIndex > -1"
                :disabled="
                  !chart.isReady ||
                  (exportItems[previousExportIndex].download &&
                    !chart.canDownload)
                "
                @click="exportChart(chart, previousExportIndex)"
              >
                <v-list-item-title
                  >Export as
                  {{
                    exportItems[previousExportIndex].title
                  }}</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </template>
        </datastream-chart>
      </v-col>
    </v-row>

    <v-dialog v-model="exportDialog" max-width="380">
      <v-card>
        <v-card-title class="headline grey lighten-4">Export as</v-card-title>

        <v-container fluid>
          <v-row dense>
            <v-col offset="1">
              <v-radio-group
                v-model="selectedExportIndex"
                class="mb-4 mt-2"
                column
                dense
                hide-details
              >
                <v-radio
                  v-for="(item, j) in exportItems"
                  :key="j"
                  :disabled="
                    item.download && selectedChart && !selectedChart.canDownload
                  "
                  :label="item.title"
                  :value="j"
                />
              </v-radio-group>
            </v-col>
          </v-row>
        </v-container>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="exportChart(selectedChart, selectedExportIndex)"
            >Export</v-btn
          >
          <v-btn text color="primary" @click="exportDialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { exportItems } from '@/lib/chart-export'
import DatastreamChart from '@/components/DatastreamChart'

export default {
  components: {
    DatastreamChart
  },

  props: {
    showControls: { default: false, type: Boolean },
    showRemove: { default: true, type: Boolean },
    value: { type: Array, required: true },
    worker: { default: null, type: Worker }
  },

  data: () => ({
    exportDialog: false,
    exportItems,

    hideLegend: false,

    pinTooltip: false,

    previousExportIndex: -1,
    selectedExportIndex: 0,

    selectedChart: null
  }),

  methods: {
    exportChart(chart, exportIndex) {
      const item = this.exportItems[exportIndex]

      this.exportDialog = false
      this.previousExportIndex = exportIndex

      chart.bus.$emit(item.event, item.options)
    },

    remove(index) {
      this.$emit('remove', index)
    },

    showExportDialog(chart) {
      this.selectedChart = chart
      this.selectedExportIndex = 0
      this.exportDialog = true
    }
  }
}
</script>

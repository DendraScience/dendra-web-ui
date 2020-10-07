<template>
  <v-card>
    <v-container v-if="value.alert" fluid>
      <v-row dense>
        <v-col>
          <v-alert
            v-model="value.alert.isShown"
            :type="value.alert.type"
            outlined
          >
            {{ value.alert.message }}
          </v-alert>
        </v-col>
      </v-row>
    </v-container>

    <div class="pt-2" style="position: relative;">
      <worker-fetch
        :id="value.id"
        :fetch-spec="Object.freeze(value.fetchSpec)"
        :worker="Object.freeze(worker)"
      >
        <hc-time-series
          v-if="worker"
          :id="value.id"
          :bus="value.bus"
          :export-chart-options="exportChartOptions"
          :group="value.group"
          :options="Object.freeze(value.options)"
          :series-options="Object.freeze(value.seriesOptions)"
          :sync-crosshairs="value.sync"
          :sync-extremes="value.sync"
          :fetch-spec="Object.freeze(value.fetchSpec)"
          :worker="Object.freeze(worker)"
        />
      </worker-fetch>

      <v-menu v-if="$scopedSlots.menu" bottom left offset-y>
        <template v-slot:activator="{ on }">
          <v-btn absolute icon right small text top v-on="on">
            <v-icon>{{ mdiDotsVertical }}</v-icon>
          </v-btn>
        </template>

        <slot name="menu" :value="value" />
      </v-menu>
    </div>
  </v-card>
</template>

<script>
import HcTimeSeries from '@/components/HcTimeSeries'
import WorkerFetch from '@/components/WorkerFetch'

export default {
  components: {
    HcTimeSeries,
    WorkerFetch
  },

  props: {
    value: { type: Object, required: true },
    worker: { default: null, type: Worker }
  },

  data: () => ({
    exportChartOptions: {
      plotOptions: {
        series: {
          dataLabels: {
            enabled: false
          }
        }
      }
    }
  })
}
</script>

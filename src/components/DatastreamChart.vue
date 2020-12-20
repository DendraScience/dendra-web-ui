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

    <div class="pt-2" style="position: relative">
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
          :options="value.options"
          :series-options="Object.freeze(value.seriesOptions)"
          :sync-crosshairs="value.sync"
          :sync-extremes="value.sync"
          :fetch-spec="Object.freeze(value.fetchSpec)"
          :worker="Object.freeze(worker)"
          tooltip-container-class="datastream-chart-tooltip-container"
          @zoomed="zoomed"
        />
      </worker-fetch>

      <div
        class="pa-2"
        style="
          background-color: rgba(255, 255, 255, 0.8);
          position: absolute;
          top: 0;
          right: 0;
        "
      >
        <v-btn
          v-if="isZoomed && showResetZoom"
          icon
          @click="value.bus.$emit('reset-zoom')"
          ><v-icon>{{ mdiMagnifyClose }}</v-icon>
        </v-btn>

        <v-btn
          v-if="showControls"
          icon
          @click="$emit('update:hideLegend', !hideLegend)"
        >
          <v-icon>{{
            hideLegend ? mdiCardBulletedOutline : mdiCardBulletedOffOutline
          }}</v-icon>
        </v-btn>

        <v-btn
          v-if="showControls"
          icon
          @click="$emit('update:pinTooltip', !pinTooltip)"
        >
          <v-icon>{{ pinTooltip ? mdiPinOff : mdiPin }}</v-icon>
        </v-btn>

        <v-menu v-if="$scopedSlots.menu" bottom left offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>{{ mdiDotsVertical }}</v-icon>
            </v-btn>
          </template>

          <slot name="menu" :value="value" />
        </v-menu>
      </div>
    </div>
  </v-card>
</template>

<script>
import HcTimeSeries from '@/components/HcTimeSeries'
import WorkerFetch from '@/components/WorkerFetch'

function fixedPositioner() {
  return { x: 0, y: 0 }
}

export default {
  components: {
    HcTimeSeries,
    WorkerFetch
  },

  props: {
    hideLegend: { default: false, type: Boolean },
    pinTooltip: { default: false, type: Boolean },
    showControls: { default: false, type: Boolean },
    showResetZoom: { default: false, type: Boolean },
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
    },

    isZoomed: false
  }),

  watch: {
    hideLegend(newValue) {
      const { pinTooltip } = this
      this.update({ hideLegend: newValue, pinTooltip })
    },

    pinTooltip(newValue) {
      const { hideLegend } = this
      this.update({ hideLegend, pinTooltip: newValue })
    }
  },

  mounted() {
    const { hideLegend, pinTooltip } = this
    this.update({ hideLegend, pinTooltip })
  },

  methods: {
    update({ hideLegend, pinTooltip }) {
      this.value.options.legend.enabled = !hideLegend
      this.value.options.tooltip = Object.assign(
        {},
        this.value.options.tooltip,
        {
          outside: pinTooltip,
          positioner: pinTooltip ? fixedPositioner : undefined,
          shape: pinTooltip ? 'square' : 'callout'
        }
      )
    },

    zoomed(state) {
      this.isZoomed = state
    }
  }
}
</script>

<style>
.datastream-chart-tooltip-container {
  position: fixed !important;
  z-index: 9999 !important;
}
</style>

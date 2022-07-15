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
          :fetch-spec="Object.freeze(value.fetchSpec)"
          :worker="Object.freeze(worker)"
          tooltip-container-class="datastream-chart-tooltip-container"
          @y-extremes="yExtremes"
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
          :disabled="!value.isReady"
          color="primary"
          icon
          @click="value.bus.$emit('reset-zoom')"
          ><v-icon>{{ mdiMagnifyClose }}</v-icon>
        </v-btn>

        <v-btn
          v-if="showControls"
          :disabled="!value.isReady"
          icon
          @click="$emit('update:hideLegend', !hideLegend)"
        >
          <v-icon>{{
            hideLegend ? mdiCardBulletedOutline : mdiCardBulletedOffOutline
          }}</v-icon>
        </v-btn>

        <v-btn
          v-if="showControls"
          :disabled="!value.isReady"
          icon
          @click="$emit('update:pinTooltip', !pinTooltip)"
        >
          <v-icon>{{ pinTooltip ? mdiPinOff : mdiPin }}</v-icon>
        </v-btn>

        <v-menu :close-on-content-click="false" bottom left offset-y>
          <template #activator="{ on }">
            <v-btn :disabled="!value.isReady" icon v-on="on">
              <v-icon>{{ mdiArrowExpandVertical }}</v-icon>
            </v-btn>
          </template>

          <y-axis-settings
            v-model="yAxisSettings"
            :chart-options="value.options"
            @commit="value.bus.$emit('set-y-extremes', $event)"
          />
        </v-menu>

        <v-menu v-if="$scopedSlots.menu" bottom left offset-y>
          <template #activator="{ on }">
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
import YAxisSettings from '@/components/YAxisSettings'

function fixedPositioner() {
  return { x: 0, y: 0 }
}

export default {
  components: {
    HcTimeSeries,
    WorkerFetch,
    YAxisSettings
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

    isZoomed: false,

    yAxisSettings: {
      index: null,
      max: null,
      min: null
    }
  }),

  watch: {
    hideLegend(newValue) {
      const { pinTooltip } = this
      this.update({ hideLegend: newValue, pinTooltip })
    },

    pinTooltip(newValue) {
      const { hideLegend } = this
      this.update({ hideLegend, pinTooltip: newValue })
    },

    'yAxisSettings.index'(newValue) {
      this.value.bus.$emit('get-y-extremes', newValue)
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

    yExtremes({ extremes }) {
      this.yAxisSettings.max = extremes.max
      this.yAxisSettings.min = extremes.min
    },

    zoomed(state) {
      this.isZoomed = state
    }
  }
}
</script>

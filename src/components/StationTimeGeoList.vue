<template>
  <v-list :color="color" dense>
    <v-list-item>
      <v-list-item-icon>
        <v-icon>{{ mdiClockOutline }}</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title
          >{{ (currentTime + value.utc_offset * 1000) | timeFormat }}
          {{ value.time_zone }} (UTC
          {{ value.utc_offset | utcOffsetHours }}
          hours)</v-list-item-title
        >
      </v-list-item-content>
      <!-- TODO: Implement reload -->
      <!--
                  <v-list-item-action>
                    <v-icon small>mdi-reload</v-icon>
                  </v-list-item-action>
 -->
    </v-list-item>

    <v-list-item v-if="value.geo">
      <v-list-item-icon>
        <v-icon>{{ mdiMapMarker }}</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title
          >{{ value.geo.coordinates[1] }}&deg;,
          {{ value.geo.coordinates[0] }}&deg;</v-list-item-title
        >
      </v-list-item-content>
    </v-list-item>

    <v-list-item v-if="value.geo && value.geo.coordinates.length > 2">
      <v-list-item-icon>
        <v-icon>{{ mdiElevationRise }}</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title
          >{{
            value.geo.coordinates[2]
              | unit('', 'm', somId === 'imp' ? 'ft' : 'm')
              | round('', 4)
          }}
          {{
            somId === 'imp' ? getUnitText('Foot') : getUnitText('Meter')
          }}</v-list-item-title
        >
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  props: {
    color: { default: '', type: String },
    currentTime: { default: 0, type: Number },
    getUnitText: { type: Function, required: true },
    somId: { default: '', type: String },
    value: { type: Object, required: true }
  }
}
</script>

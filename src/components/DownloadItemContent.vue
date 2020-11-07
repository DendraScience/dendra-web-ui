<template>
  <v-list-item-content>
    <v-list-item-title v-text="value.spec.comment"></v-list-item-title>

    <v-list-item-subtitle
      >Submitted: {{ value.created_at | dateTimeFormatLocal }} ({{
        value.created_at | timeFromNow
      }})</v-list-item-subtitle
    >

    <v-progress-linear
      v-if="showProgress"
      :value="progressValue"
      color="orange"
      buffer-value="0"
      stream
    ></v-progress-linear>

    <v-list-item-subtitle v-if="value.error">{{
      value.error
    }}</v-list-item-subtitle>

    <v-list-item-subtitle v-else>
      {{
        value.spec.options &&
        value.spec.options.datastream_ids &&
        value.spec.options.datastream_ids.length
          | counted('datastream,', 'datastreams,')
      }}
      {{
        value.result &&
        value.result.datapoints_count | counted('datapoint,', 'datapoints,')
      }}
      {{
        value.result &&
        value.result.record_count | counted('record,', 'records,')
      }}
      {{ value.spec.method }}
    </v-list-item-subtitle>
  </v-list-item-content>
</template>

<script>
export default {
  props: {
    showProgress: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  computed: {
    progressValue() {
      const { result, spec } = this.value
      if (
        spec.options &&
        spec.options.begins_at &&
        spec.options.ends_before &&
        result &&
        result.recent_time
      ) {
        const startTime = new Date(spec.options.begins_at).getTime()
        const finishTime =
          new Date(spec.options.ends_before).getTime() - startTime
        const recentTime = result.recent_time - startTime
        return (recentTime / finishTime) * 100
      }
      return 0
    }
  }
}
</script>

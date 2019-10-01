import _get from 'lodash/get'
import {
  dateRangeFromItem,
  defaultDateRange,
  newDateRange,
  resolveDateRange,
  resolvedToIntervalRange
} from '@/lib/date'

export default {
  data: () => ({
    datapointsConfig: {
      dialog: false,
      dateRange: newDateRange(),
      tabIndex: 0
    },
    datapointsConfigKey: -1
  }),

  computed: {
    configDateRangeResolved() {
      return resolveDateRange(this.datapointsConfig.dateRange)
    },

    configParamsResolved() {
      const { configPathItems: pathItems, datapointsConfig: value } = this
      const resolved = { data: null, valid: true }

      try {
        resolved.data = JSON.parse(value.params)
      } catch (err) {
        resolved.error = `Parse error: ${err.message}.`
        resolved.valid = false
      }

      if (resolved.data) {
        const pathItem = pathItems.find(item => item.value === value.path)

        if (!pathItem) {
          resolved.error = 'Path not found.'
          resolved.valid = false
        } else {
          const missingField = pathItem.spec.required.find(
            field => _get(resolved.data, field) === undefined
          )
          if (missingField) {
            resolved.error = `${missingField} is a required parameter field.`
            resolved.valid = false
          }
        }
      }

      return resolved
    }
  },

  methods: {
    addDatapointsConfig() {
      this.datapointsConfig = {
        dialog: true,
        dateRange: defaultDateRange(),
        params: '{}',
        path: null,
        tabIndex: 0
      }
      this.datapointsConfigKey = -1

      requestAnimationFrame(() => {
        this.$refs.datapointsConfigDialog.$refs.observer.reset()
      })
    },

    editDatapointsConfig(item) {
      this.datapointsConfig = {
        dialog: true,
        dateRange: dateRangeFromItem(item),
        params: item.params,
        path: item.path,
        tabIndex: 0
      }
      this.datapointsConfigKey = item.key

      requestAnimationFrame(() => {
        this.$refs.datapointsConfigDialog.$refs.observer.reset()
      })
    },

    commitDatapointsConfig({ path }) {
      const {
        configDateRangeResolved: dateRangeResolved,
        configParamsResolved: paramsResolved,
        datapointsConfigKey,
        value
      } = this
      const newInst = {
        ...resolvedToIntervalRange(dateRangeResolved),
        params: paramsResolved.data,
        path
      }

      if (datapointsConfigKey > -1) {
        value.datapoints_config = value.datapoints_config.map((inst, index) =>
          index === datapointsConfigKey ? newInst : inst
        )
      } else {
        value.datapoints_config.push(newInst)
      }

      this.datapointsConfig.dialog = false
    },

    removeDatapointsConfig(item) {
      this.value.datapoints_config = this.value.datapoints_config.filter(
        (interval, index) => index !== item.key
      )
    }
  }
}

import _get from 'lodash/get'
import {
  dateRangeFromItem,
  defaultDateRange,
  newDateRange,
  resolveDateRange,
  resolvedToIntervalRange
} from '@/lib/date'
import {
  resolveAttributes,
  resolveDatapoint,
  resolveExpr,
  resolveResult
} from '@/lib/evaluate'
import { sampleAttributes, sampleDatapoint } from '@/lib/samples'
import { jsonFormat } from '@/lib/utils'

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
    },

    configAttributesResolved() {
      return resolveAttributes(this.datapointsConfig.attributes)
    },

    configDatapointResolved() {
      return resolveDatapoint(this.datapointsConfig.datapoint)
    },

    configExprResolved() {
      return resolveExpr(
        this.datapointsConfig.expr,
        this.configAttributesResolved
      )
    },

    configResultResolved() {
      return resolveResult(
        this.configDatapointResolved,
        this.configExprResolved
      )
    }
  },

  methods: {
    addDatapointsConfig() {
      this.datapointsConfig = {
        attributes: jsonFormat(sampleAttributes()),
        datapoint: jsonFormat(sampleDatapoint()),
        dialog: true,
        dateRange: defaultDateRange(),
        expr: null,
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
        attributes: jsonFormat(sampleAttributes()),
        datapoint: jsonFormat(sampleDatapoint()),
        dialog: true,
        dateRange: dateRangeFromItem(item),
        expr: item.actions && item.actions.evaluate,
        params: item.params,
        path: item.path,
        tabIndex: 0
      }
      this.datapointsConfigKey = item.key

      requestAnimationFrame(() => {
        this.$refs.datapointsConfigDialog.$refs.observer.reset()
      })
    },

    commitDatapointsConfig({ expr, path }) {
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

      if (expr && expr.length) newInst.actions = { evaluate: expr }

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

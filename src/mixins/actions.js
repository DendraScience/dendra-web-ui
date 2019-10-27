import _get from 'lodash/get'
import _union from 'lodash/union'
import math from '@/lib/math'
import { attributeData } from '@/lib/attribute'
import { jsonFormat } from '@/lib/utils'

export default {
  data: () => ({
    attribAction: {
      dialog: false
    },

    evaluateAction: {
      dialog: false
    },

    flagAction: {
      dialog: false
    }
  }),

  computed: {
    evaluateAttributesResolved() {
      const { evaluateAction: value } = this
      const resolved = { data: null, valid: true }

      try {
        resolved.data = JSON.parse(value.attributes)
      } catch (err) {
        resolved.error = `Parse error: ${err.message}.`
        resolved.valid = false
      }

      return resolved
    },

    evaluateDatapointResolved() {
      const { evaluateAction: value } = this
      const resolved = { data: null, valid: true }

      try {
        resolved.data = JSON.parse(value.datapoint)
      } catch (err) {
        resolved.error = `Parse error: ${err.message}.`
        resolved.valid = false
      }

      return resolved
    },

    evaluateExprResolved() {
      const {
        evaluateAttributesResolved: attributesResolved,

        evaluateAction: value
      } = this
      const resolved = { code: null, valid: true }
      let expr = value.expr || ''

      expr = expr.replace(/@{([.\w]+)}/g, (m, p) =>
        _get(attributesResolved.data, p, null)
      )

      try {
        resolved.code = math.compile(expr)
      } catch (err) {
        resolved.error = `Compile error: ${err.message}.`
        resolved.valid = false
      }

      return resolved
    },

    evaluateResultResolved() {
      const {
        evaluateDatapointResolved: datapointResolved,
        evaluateExprResolved: exprResolved
      } = this
      const resolved = { valid: true }

      if (datapointResolved.valid) {
        const data = JSON.parse(JSON.stringify(datapointResolved.data))

        if (exprResolved.valid) {
          try {
            exprResolved.code.evaluate(data)
          } catch (err) {
            resolved.error = `Evaluate error: ${err.message}.`
            resolved.valid = false
          }
        }

        resolved.datapoint = jsonFormat(data)
      }

      return resolved
    }
  },

  methods: {
    addAction(item) {
      if (item.target === 'attrib') {
        this.attribAction = {
          dialog: true,
          single: {
            booleanValue: false,
            key: null,
            keyDisabled: false,
            target: 'value',
            textValue2: null,
            textValue: null,
            type: null,
            unitTag: null
          },
          struct: {
            booleanValue: false,
            key: null,
            keyDisabled: false,
            target: 'object',
            textValue2: null,
            textValue: null,
            type: null,
            unitTag: null
          },
          type: 'single'
        }

        requestAnimationFrame(() => {
          this.$refs.attribActionDialog.$refs.observer.reset()
        })
      } else if (item.target === 'evaluate') {
        this.evaluateAction = {
          attributes: jsonFormat(this.evaluateSample.attributes),
          datapoint: jsonFormat(this.evaluateSample.datapoint),
          dialog: true,
          expr: 'v = number(v * @{height})'
        }

        requestAnimationFrame(() => {
          this.$refs.evaluateActionDialog.$refs.observer.reset()
        })
      } else if (item.target === 'exclude') {
        const { value } = this
        const action = value.actions.find(
          action => action.exclude !== undefined
        )

        if (!action) value.actions.push({ exclude: true })
      } else if (item.target === 'flag') {
        this.flagAction = {
          dialog: true,
          flag: null
        }

        requestAnimationFrame(() => {
          this.$refs.flagActionDialog.$refs.observer.reset()
        })
      }
    },

    commitAttribAction(commit) {
      commit = commit[commit.type]

      const { value } = this
      const action = value.actions.find(action => action.attrib !== undefined)
      const data = attributeData(commit)

      if (data !== undefined) {
        const attrib = {
          [commit.key]: data
        }
        if (action) {
          action.attrib = Object.assign({}, action.attrib, attrib)
        } else {
          value.actions.push({ attrib })
        }
      }

      this.attribAction.dialog = false
    },

    commitEvaluateAction({ expr }) {
      const { value } = this
      const action = value.actions.find(action => action.evaluate !== undefined)

      if (action) {
        action.evaluate = expr
      } else {
        value.actions.push({ evaluate: expr })
      }

      this.evaluateAction.dialog = false
    },

    commitFlagAction({ flag }) {
      const { value } = this
      const action = value.actions.find(action => action.flag !== undefined)

      if (action) {
        action.flag = _union(action.flag, [flag])
      } else {
        value.actions.push({ flag: [flag] })
      }

      this.flagAction.dialog = false
    },

    removeAction({ key }) {
      this.value.actions = this.value.actions.filter(
        (action, index) => index !== key
      )
    }
  }
}

import _union from 'lodash/union'
import { attributeData } from '@/lib/attribute'
import {
  resolveAttributes,
  resolveDatapoint,
  resolveExpr,
  resolveResult
} from '@/lib/evaluate'
import { sampleAttributes, sampleDatapoint, sampleExpr } from '@/lib/samples'
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
      return resolveAttributes(this.evaluateAction.attributes)
    },

    evaluateDatapointResolved() {
      return resolveDatapoint(this.evaluateAction.datapoint)
    },

    evaluateExprResolved() {
      return resolveExpr(
        this.evaluateAction.expr,
        this.evaluateAttributesResolved
      )
    },

    evaluateResultResolved() {
      return resolveResult(
        this.evaluateDatapointResolved,
        this.evaluateExprResolved
      )
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
          attributes: jsonFormat(sampleAttributes()),
          datapoint: jsonFormat(sampleDatapoint()),
          dialog: true,
          expr: sampleExpr()
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

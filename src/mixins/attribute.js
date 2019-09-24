export default {
  data: () => ({
    attribute: {
      dialog: false,
      keyDisabled: false
    }
  }),

  methods: {
    addAttribute({ target }) {
      this.attribute = {
        dialog: true,
        key: null,
        keyDisabled: false,
        booleanValue: false,
        target,
        textValue: null,
        textValue2: null,
        type: null,
        unitTag: null
      }

      requestAnimationFrame(() => {
        this.$refs.attributeDialog.$refs.observer.reset()
      })
    },

    editAttribute({ key, target }) {
      const attribute = this.value.attributes[key]
      const type = typeof attribute

      // TODO: Clean up!!!
      if (target === 'object') {
        if (Array.isArray(attribute.delta)) {
          this.attribute = {
            dialog: true,
            key,
            keyDisabled: true,
            booleanValue: false,
            target,
            textValue: attribute.delta[0],
            textValue2: attribute.delta[1],
            type: 'delta',
            unitTag: attribute.unit_tag
          }
        } else if (Array.isArray(attribute.range)) {
          this.attribute = {
            dialog: true,
            key,
            keyDisabled: true,
            booleanValue: false,
            target,
            textValue: attribute.range[0],
            textValue2: attribute.range[1],
            type: 'range',
            unitTag: attribute.unit_tag
          }
        } else {
          this.attribute = {
            dialog: true,
            key,
            keyDisabled: true,
            booleanValue: false,
            target,
            textValue: attribute.value,
            textValue2: null,
            type: 'value',
            unitTag: attribute.unit_tag
          }
        }
      } else if (target === 'value') {
        if (type === 'boolean') {
          this.attribute = {
            dialog: true,
            key,
            keyDisabled: true,
            booleanValue: attribute,
            target,
            textValue: null,
            textValue2: null,
            type,
            unitTag: null
          }
        } else {
          this.attribute = {
            dialog: true,
            key,
            keyDisabled: true,
            booleanValue: false,
            target,
            textValue: `${attribute}`,
            textValue2: null,
            type,
            unitTag: null
          }
        }
      }

      requestAnimationFrame(() => {
        this.$refs.attributeDialog.$refs.observer.reset()
      })
    },

    commitAttribute({
      key,
      booleanValue,
      target,
      textValue,
      textValue2,
      type,
      unitTag
    }) {
      const { value } = this
      let data

      if (target === 'object') {
        data = {}
        if (type === 'delta' || type === 'range') {
          data[type] = [parseFloat(textValue), parseFloat(textValue2)]
        } else if (type === 'value') {
          data[type] = parseFloat(textValue)
        }
        if (unitTag) data.unit_tag = unitTag
      } else if (target === 'value') {
        if (type === 'boolean') {
          data = booleanValue
        } else if (type === 'number') {
          data = parseFloat(textValue)
        } else {
          data = textValue
        }
      }

      if (data) this.$set(value.attributes, key, data)

      this.attribute.dialog = false
    },

    removeAttribute({ key }) {
      this.$delete(this.value.attributes, key)
    }
  }
}

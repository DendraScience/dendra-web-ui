import { attributeData } from '@/lib/attribute'

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
        booleanValue: false,
        dialog: true,
        key: null,
        keyDisabled: false,
        target,
        textValue2: null,
        textValue: null,
        type: null,
        unitTag: null
      }

      requestAnimationFrame(() => {
        this.$refs.attributeDialog.$refs.observer.reset()
      })
    },

    editAttribute({ key, target }) {
      const data = this.value.attributes[key]
      const type = typeof attribute

      if (target === 'object') {
        const attribute = {
          booleanValue: false,
          dialog: true,
          key,
          keyDisabled: true,
          target,
          unitTag: data.unit_tag
        }

        if (Array.isArray(data.delta)) {
          this.attribute = Object.assign(attribute, {
            textValue2: data.delta[1],
            textValue: data.delta[0],
            type: 'delta'
          })
        } else if (Array.isArray(data.range)) {
          this.attribute = Object.assign(attribute, {
            textValue2: data.range[1],
            textValue: data.range[0],
            type: 'range'
          })
        } else {
          this.attribute = Object.assign(attribute, {
            textValue2: null,
            textValue: data.value,
            type: 'value'
          })
        }
      } else if (target === 'value') {
        const attribute = {
          dialog: true,
          key,
          keyDisabled: true,
          target,
          textValue2: null,
          type,
          unitTag: null
        }

        if (type === 'boolean') {
          this.attribute = Object.assign(attribute, {
            booleanValue: data,
            textValue: null
          })
        } else {
          this.attribute = Object.assign(attribute, {
            booleanValue: false,
            textValue: `${data}`
          })
        }
      }

      requestAnimationFrame(() => {
        this.$refs.attributeDialog.$refs.observer.reset()
      })
    },

    commitAttribute(commit) {
      const { value } = this
      const data = attributeData(commit)

      if (data) this.$set(value.attributes, commit.key, data)

      this.attribute.dialog = false
    },

    removeAttribute({ key }) {
      this.$delete(this.value.attributes, key)
    }
  }
}

<template>
  <v-layout v-if="instance" column pt-3>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout v-if="!editing">
          <v-flex>
            <h4 class="display-1 font-weight-light mb-2">Annotation details</h4>
          </v-flex>
        </v-layout>

        <v-layout column>
          <v-flex>
            <annotation-detail
              v-model="instance"
              :editing="editing"
              :org="org"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>

    <v-btn
      v-if="!editing && $can('patch', instance)"
      color="primary"
      dark
      fab
      fixed
      bottom
      left
      @click="edit"
    >
      <v-icon>edit</v-icon>
    </v-btn>
  </v-layout>
</template>

<script>
import AnnotationDetail from '@/components/AnnotationDetail'

import _merge from 'lodash/merge'
import _pick from 'lodash/pick'

import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    AnnotationDetail
  },

  layout: 'editor',

  middleware: ['check-org', 'check-annotation', 'reset-editing'],

  data: () => ({
    instance: null
  }),

  computed: {
    ...mapGetters(['org', 'annotation']),

    ...mapState('ux', ['editing'])
  },

  watch: {
    instance: {
      handler() {
        this.incEditorDirty()
      },
      deep: true
    }
  },

  mounted() {
    this.$bus.$on('editor-cancel', this.onCancel)
    this.$bus.$on('editor-save', this.onSave)

    this.setEditorColor('primary')
    this.setEditorDirty(-1)
    this.instance = _merge({}, this.annotation)
  },

  beforeDestroy() {
    this.$bus.$off('editor-cancel', this.onCancel)
    this.$bus.$off('editor-save', this.onSave)
  },

  beforeRouteLeave(to, from, next) {
    this.$bus.$emit('edit-leave', { next })
  },

  methods: {
    ...mapActions({
      patch: 'annotations/patch'
    }),

    ...mapMutations({
      setEditing: 'ux/setEditing',
      incEditorDirty: 'ux/incEditorDirty',
      setEditorColor: 'ux/setEditorColor',
      setEditorDirty: 'ux/setEditorDirty',
      setEditorTitle: 'ux/setEditorTitle'
    }),

    edit() {
      this.setEditorDirty(0)
      this.setEditorTitle('Edit annotation')
      this.setEditing(true)
    },

    onCancel() {
      this.setEditing(false)
      this.setEditorDirty(-1)
      this.instance = _merge({}, this.annotation)
    },

    async onSave() {
      if (!(await this.$validator.validateAll())) return

      const { instance } = this
      const $set = _pick(instance, [
        'datastream_ids',
        'description',
        'is_enabled',
        'state',
        'station_ids',
        'title'
      ])

      try {
        await this.patch([instance._id, { $set }, {}])

        this.setEditing(false)
        this.setEditorDirty(-1)
        this.instance = _merge({}, this.annotation)
        this.$bus.$emit('edit-status', {
          type: 'success',
          message: 'Annotation saved.' // TODO: Localize
        })
      } catch (err) {
        this.$bus.$emit('edit-status', { type: 'error', message: err.message })
      }
    }
  }
}
</script>

<template>
  <v-layout v-if="instance && org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout v-if="!editing">
          <v-flex>
            <h4 class="display-1 font-weight-light my-3">Annotation details</h4>
          </v-flex>
        </v-layout>

        <v-layout column>
          <v-flex>
            <ValidationObserver ref="observer">
              <annotation-detail
                v-model="instance"
                :editing="editing"
                :org="org"
              />
            </ValidationObserver>
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
      right
      style="top: 80px;"
      top
      @click="edit"
    >
      <v-icon>edit</v-icon>
    </v-btn>
  </v-layout>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import { ValidationObserver } from 'vee-validate'
import _merge from 'lodash/merge'
import { patchData } from '@/lib/edit'
import AnnotationDetail from '@/components/AnnotationDetail'

export default {
  components: {
    AnnotationDetail,
    ValidationObserver
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
        if (this.editing) this.incEditorDirty()
      },
      deep: true
    }
  },

  mounted() {
    this.$bus.$on('editor-cancel', this.onCancel)
    this.$bus.$on('editor-save', this.onSave)

    this.setEditorColor('primary')
    this.setEditorDirty(-1)
    this.initInstance()
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
      fetchAnnotations: 'annotations/find',
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

    initInstance() {
      this.instance = _merge(
        {
          actions: [],
          datastream_ids: [],
          intervals: [],
          involved_parties: [],
          station_ids: []
        },
        this.annotation
      )
    },

    onCancel() {
      this.setEditing(false)
      this.setEditorDirty(-1)
      this.initInstance()
    },

    async onSave() {
      if (!(await this.$refs.observer.validate())) return

      const { instance } = this
      const data = patchData(instance)

      try {
        // HACK: Ensure that we have a fresh model afterwards
        this.$store.commit('annotations/removeItem', instance._id)

        await this.patch([instance._id, data, {}])
        await this.fetchAnnotations({ query: { _id: instance._id } })

        this.setEditing(false)
        this.setEditorDirty(-1)
        this.initInstance()
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

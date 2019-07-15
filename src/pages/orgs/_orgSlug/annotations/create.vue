<template>
  <v-layout v-if="instance" column pt-3>
    <v-flex>
      <v-container grid-list-xl>
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
  </v-layout>
</template>

<script>
import AnnotationDetail from '@/components/AnnotationDetail'

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
    this.$bus.$on('editor-cancel', this.cancel)
    this.$bus.$on('editor-save', this.save)

    this.setEditorColor('secondary')
    this.setEditorDirty(-1)
    this.setEditorTitle('New annotation')
    this.setEditing(true)
    this.instance = {
      datastream_ids: [],
      description: '',
      organization_id: this.org._id,
      state: 'pending',
      station_ids: [],
      title: ''
    }
  },

  beforeDestroy() {
    this.$bus.$off('editor-cancel', this.cancel)
    this.$bus.$off('editor-save', this.save)
  },

  beforeRouteLeave(to, from, next) {
    this.$bus.$emit('edit-leave', { next })
  },

  methods: {
    ...mapActions({
      create: 'annotations/create'
    }),

    ...mapMutations({
      setEditing: 'ux/setEditing',
      incEditorDirty: 'ux/incEditorDirty',
      setEditorColor: 'ux/setEditorColor',
      setEditorDirty: 'ux/setEditorDirty',
      setEditorTitle: 'ux/setEditorTitle'
    }),

    cancel() {
      this.setEditing(false)
      this.setEditorDirty(-1)
      this.$router.push({
        name: 'orgs-orgSlug-annotations',
        params: { orgSlug: this.org.slug }
      })
    },

    edit() {
      this.setEditorDirty(0)
      this.setEditorTitle('Edit annotation')
      this.setEditing(true)
    },

    async save() {
      if (!(await this.$validator.validateAll())) return

      const { instance } = this
      const data = _pick(instance, [
        'datastream_ids',
        'description',
        'organization_id',
        'state',
        'station_ids',
        'title'
      ])

      if (data.datastream_ids.length === 0) delete data.datastream_ids
      if (data.station_ids.length === 0) delete data.station_ids

      try {
        const res = await this.create([data, {}])

        this.setEditing(false)
        this.setEditorDirty(-1)
        this.$router.push(
          {
            name: 'orgs-orgSlug-annotations-annotationId',
            params: { orgSlug: this.org.slug, annotationId: res._id }
          },
          () => {
            this.$bus.$emit('edit-status', {
              type: 'success',
              message: 'Annotation created.' // TODO: Localize
            })
          }
        )
      } catch (err) {
        this.$bus.$emit('edit-status', { type: 'error', message: err.message })
      }
    }
  }
}
</script>

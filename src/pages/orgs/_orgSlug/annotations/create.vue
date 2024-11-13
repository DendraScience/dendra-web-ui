<template>
  <v-container v-if="instance && org">
    <v-row>
      <v-col>
        <ValidationObserver ref="observer">
          <annotation-detail v-model="instance" :editing="editing" :org="org" />
        </ValidationObserver>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import { ValidationObserver } from 'vee-validate'
import _merge from 'lodash/merge'
import { createData, defaultAnnotation } from '@/lib/edit'
import AnnotationDetail from '@/components/AnnotationDetail'

export default {
  components: {
    AnnotationDetail,
    ValidationObserver
  },

  beforeRouteLeave(to, from, next) {
    this.$bus.$emit('edit-leave', { next })
  },

  layout: 'editor',

  middleware: ['no-auth-redirect-home', 'check-org', 'reset-editing'],

  data: () => ({
    instance: null
  }),

  computed: {
    ...mapGetters(['org', 'annotation']),

    ...mapState(['auth']),
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
    this.$bus.$on('editor-cancel', this.cancel)
    this.$bus.$on('editor-save', this.save)

    this.setEditorColor('secondary')
    this.setEditorDirty(-1)
    this.setEditorTitle('New annotation')
    this.setEditing(true)
    this.initInstance()
  },

  beforeDestroy() {
    this.$bus.$off('editor-cancel', this.cancel)
    this.$bus.$off('editor-save', this.save)
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

    initInstance() {
      this.instance = _merge(defaultAnnotation(this.org), {
        involved_parties: [
          {
            person_id: this.auth.user.person_id,
            roles: ['contact', 'reporter']
          }
        ]
      })
    },

    async save() {
      if (!(await this.$refs.observer.validate())) return

      const { instance } = this
      const data = createData(instance)

      data.organization_id = instance.organization_id

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

<template>
  <v-container v-if="instance">
    <v-row>
      <v-col>
        <ValidationObserver ref="observer">
          <organization-details v-model="instance" :editing="editing" />
        </ValidationObserver>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import { ValidationObserver } from 'vee-validate'
import { createData, defaultOrganization } from '@/lib/edit'
import OrganizationDetails from '@/components/OrganizationDetails'

export default {
  components: {
    OrganizationDetails,
    ValidationObserver
  },

  beforeRouteLeave(_to, _from, next) {
    this.$bus.$emit('edit-leave', { next })
  },

  layout: 'editor',

  middleware: [
    'create-ability',
    'no-org',
    'no-auth-redirect-home',
    'reset-editing'
  ],

  data: () => ({
    instance: null
  }),

  computed: {
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
    this.setEditorTitle('New organization')
    this.setEditing(true)
    this.initInstance()
  },

  beforeDestroy() {
    this.$bus.$off('editor-cancel', this.cancel)
    this.$bus.$off('editor-save', this.save)
  },

  methods: {
    ...mapActions({
      create: 'organizations/create'
    }),

    ...mapMutations({
      setEditing: 'ux/setEditing',
      incEditorDirty: 'ux/incEditorDirty',
      setEditorColor: 'ux/setEditorColor',
      setEditorDirty: 'ux/setEditorDirty',
      setEditorTitle: 'ux/setEditorTitle',
      setIsLoading: 'ux/setIsLoading'
    }),

    cancel() {
      this.setEditing(false)
      this.setEditorDirty(-1)
      this.$router.push({
        name: 'organizations'
      })
    },

    initInstance() {
      this.instance = defaultOrganization()
    },

    async save() {
      if (!(await this.$refs.observer.validate())) return

      try {
        this.setIsLoading(true)

        const { instance } = this
        const data = createData(instance)
        const res = await this.create([data, {}])
        this.setEditing(false)
        this.setEditorDirty(-1)
        this.$router.push(
          {
            name: 'organizations-orgId',
            params: { orgId: res._id }
          },
          () => {
            this.$bus.$emit('edit-status', {
              type: 'success',
              message: 'Organization created.' // TODO: Localize
            })
          }
        )
      } catch (err) {
        this.$bus.$emit('edit-status', {
          type: 'error',
          message: err.message
        })
      } finally {
        this.setIsLoading(false)
      }
    }
  }
}
</script>

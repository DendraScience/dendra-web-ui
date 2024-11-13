<template>
  <v-container v-if="instance">
    <v-row>
      <v-col>
        <ValidationObserver ref="observer">
          <company-detail v-model="instance" :editing="editing" />
        </ValidationObserver>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import { ValidationObserver } from 'vee-validate'
import { createData, defaultCompany } from '@/lib/edit'
import CompanyDetail from '@/components/CompanyDetail'

export default {
  components: {
    CompanyDetail,
    ValidationObserver
  },

  beforeRouteLeave(to, from, next) {
    this.$bus.$emit('edit-leave', { next })
  },

  layout: 'editor',

  middleware: ['no-org', 'no-auth-redirect-home', 'reset-editing'],

  data: () => ({
    instance: null
  }),

  computed: {
    ...mapGetters(['company']),

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
    this.setEditorTitle('New company')
    this.setEditing(true)
    this.initInstance()
  },

  beforeDestroy() {
    this.$bus.$off('editor-cancel', this.cancel)
    this.$bus.$off('editor-save', this.save)
  },

  methods: {
    ...mapActions({
      create: 'companies/create'
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
        name: 'companies'
      })
    },

    initInstance() {
      this.instance = defaultCompany()
    },

    async save() {
      if (!(await this.$refs.observer.validate())) return

      const { instance } = this
      const data = createData(instance)

      try {
        const res = await this.create([data, {}])

        this.setEditing(false)
        this.setEditorDirty(-1)
        this.$router.push(
          {
            name: 'companies-companyId',
            params: { companyId: res._id }
          },
          () => {
            this.$bus.$emit('edit-status', {
              type: 'success',
              message: 'Company created.' // TODO: Localize
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

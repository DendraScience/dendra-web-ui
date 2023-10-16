<template>
  <v-container v-if="instance">
    <v-row v-if="!editing">
      <v-col>
        <h2 class="display-1 font-weight-regular">Organization details</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <ValidationObserver ref="observer">
          <organization-detail v-model="instance" :editing="editing" />
        </ValidationObserver>
      </v-col>
    </v-row>

    <v-btn
      v-show="!editing && $canPatch('organizations', instance)"
      color="primary"
      dark
      fab
      fixed
      right
      style="top: 80px"
      top
      @click="edit"
    >
      <v-icon>{{ mdiPencil }}</v-icon>
    </v-btn>
  </v-container>
</template>
<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import _merge from 'lodash/merge'
import { ValidationObserver } from 'vee-validate'
import { defaultOrganization, patchData } from '@/lib/edit'
import OrganizationDetail from '@/components/OrganizationDetail'

export default {
  components: {
    OrganizationDetail,
    ValidationObserver
  },

  beforeRouteLeave(_to, _from, next) {
    this.$bus.$emit('edit-leave', { next })
  },

  layout: 'editor',

  middleware: ['check-org', 'no-auth-redirect-home', 'reset-editing'],

  meta: {
    authority: true
  },

  data: () => ({
    instance: null
  }),

  computed: {
    ...mapGetters(['org']),

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

  methods: {
    ...mapActions({
      fetchOrganizations: 'organizations/find',
      patch: 'organizations/patch'
    }),

    ...mapMutations({
      setEditing: 'ux/setEditing',
      incEditorDirty: 'ux/incEditorDirty',
      setEditorColor: 'ux/setEditorColor',
      setEditorDirty: 'ux/setEditorDirty',
      setEditorTitle: 'ux/setEditorTitle',
      setIsLoading: 'ux/setIsLoading'
    }),

    edit() {
      this.setEditorDirty(0)
      this.setEditorTitle('Edit Organization')
      this.setEditing(true)
    },

    initInstance() {
      this.instance = _merge(defaultOrganization(), this.org)
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

      this.setIsLoading(true)

      try {
        // HACK: Ensure that we have a fresh model afterwards
        this.$store.commit('organizations/removeItem', instance._id)

        await this.patch([instance._id, data, {}])
        await this.fetchOrganizations({ query: { _id: instance._id } })

        this.setEditing(false)
        this.setEditorDirty(-1)
        this.initInstance()
        this.$bus.$emit('edit-status', {
          type: 'success',
          message: 'Organization saved.' // TODO: Localize
        })
      } catch (err) {
        this.$bus.$emit('edit-status', { type: 'error', message: err.message })

        // HACK: Ensure that we have a fresh model afterwards
        this.$store.commit('organizations/removeItem', instance._id)

        await this.fetchOrganizations({ query: { _id: instance._id } })
      } finally {
        this.setIsLoading(false)
      }
    }
  }
}
</script>

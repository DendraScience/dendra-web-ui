<template>
  <v-container v-if="instance">
    <v-row v-if="!editing">
      <v-col>
        <h2 class="display-1 font-weight-regular">User details</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <ValidationObserver ref="observer">
          <User-detail v-model="instance" :editing="editing" />
        </ValidationObserver>
      </v-col>
    </v-row>

    <v-row v-if="!editing">
      <v-col>
        <user-password-edit
          :current-password-required="
            $cannotPatch('users', { _id: instance._id })
          "
          :edit-status="!editing"
          :user="instance"
        />
      </v-col>
    </v-row>

    <v-btn
      v-show="!editing && $canPatch('users', instance)"
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
import { ValidationObserver } from 'vee-validate'
import _merge from 'lodash/merge'
import _omit from 'lodash/omit'
import { defaultUser, patchData } from '@/lib/edit'
import UserDetail from '@/components/UserDetail'
import UserPasswordEdit from '@/components/UserPasswordEdit'
export default {
  components: {
    UserDetail,
    UserPasswordEdit,
    ValidationObserver
  },

  beforeRouteLeave(_to, _from, next) {
    this.$bus.$emit('edit-leave', { next })
  },

  layout: 'editor',

  middleware: [
    'no-org',
    'no-auth-redirect-home',
    'check-user',
    'reset-editing'
  ],

  data: () => ({
    instance: null
  }),

  computed: {
    ...mapGetters(['user']),

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
      fetchUsers: 'users/find',
      patch: 'users/patch'
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
      this.setEditorTitle('Edit user')
      this.setEditing(true)
    },

    initInstance() {
      this.instance = _merge(defaultUser(), {
        ...this.user,
        roles: this.user.roles[0] // for view user role
      })
    },

    onCancel() {
      this.setEditing(false)
      this.setEditorDirty(-1)
      this.initInstance()
    },

    async onSave() {
      if (!(await this.$refs.observer.validate())) return

      const { instance } = this
      const value = _omit(instance, ['password'])
      const data = patchData({
        ...value,
        roles: [instance.roles]
      })

      this.setIsLoading(true)

      try {
        // HACK: Ensure that we have a fresh model afterwards
        this.$store.commit('users/removeItem', instance._id)

        await this.patch([instance._id, data, {}])
        await this.fetchUsers({ query: { _id: instance._id } })

        this.setEditing(false)
        this.setEditorDirty(-1)
        this.initInstance()
        this.$bus.$emit('edit-status', {
          type: 'success',
          message: 'User saved.' // TODO: Localize
        })
      } catch (err) {
        this.$bus.$emit('edit-status', { type: 'error', message: err.message })

        // HACK: Ensure that we have a fresh model afterwards
        this.$store.commit('users/removeItem', instance._id)

        await this.fetchUsers({ query: { _id: instance._id } })
      } finally {
        this.setIsLoading(false)
      }
    }
  }
}
</script>

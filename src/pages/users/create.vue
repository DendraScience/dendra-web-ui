<template>
  <v-container v-if="instance">
    <v-row>
      <v-col>
        <ValidationObserver ref="observer">
          <user-detail v-model="instance" :editing="editing" :create="true" />
        </ValidationObserver>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import { ValidationObserver } from 'vee-validate'
import { createData, defaultUser } from '@/lib/edit'
import UserDetail from '@/components/UserDetail.vue'

export default {
  components: {
    ValidationObserver,
    UserDetail
  },

  layout: 'editor',

  middleware: ['no-org', 'no-auth-redirect-home', 'reset-editing'],

  data: () => ({
    instance: null
  }),

  computed: {
    ...mapGetters(['user']),

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
    this.setEditorTitle('New user')
    this.setEditing(true)
    this.initInstance()
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
      create: 'users/create',
      createPerson: 'persons/create',
      fetchPersons: 'persons/find'
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
        name: 'users'
      })
    },

    initInstance() {
      this.instance = defaultUser()
    },

    async personCreate() {
      const {
        // eslint-disable-next-line camelcase
        instance: { email, full_name, name }
      } = this
      const data = createData({ email, full_name, name })
      return await this.createPerson([data, {}])
    },

    async userCreate(personId) {
      try {
        const { instance } = this
        const data = createData({
          ...instance,
          person_id: personId,
          roles: [instance.roles]
        })
        const res = await this.create([data, {}])

        this.setEditing(false)
        this.setEditorDirty(-1)
        this.$router.push(
          {
            name: 'users-userId',
            params: { userId: res._id }
          },
          () => {
            this.$bus.$emit('edit-status', {
              type: 'success',
              message: 'User created.' // TODO: Localize
            })
          }
        )
      } catch (err) {
        this.$bus.$emit('edit-status', {
          type: 'error',
          message: err.message
        })
      }
    },

    async save() {
      if (!(await this.$refs.observer.validate())) return

      const { instance } = this

      try {
        const person = await this.fetchPersons({
          query: {
            email: instance.email,
            $limit: 1,
            $select: ['_id']
          }
        })

        if (person && person.data && person.data.length) {
          const personId = person.data[0]._id
          this.userCreate(personId)
        } else {
          const response = await this.personCreate()
          const personId = response._id
          this.userCreate(personId)
        }
      } catch (err) {
        console.log('err', err)
      }
    }
  }
}
</script>

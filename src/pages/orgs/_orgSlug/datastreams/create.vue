<template>
  <v-layout v-if="instance && org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout column>
          <v-flex>
            <ValidationObserver ref="observer">
              <datastream-detail
                v-model="instance"
                :editing="editing"
                :org="org"
              />
            </ValidationObserver>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import { ValidationObserver } from 'vee-validate'
import { createData } from '@/lib/edit'
import DatastreamDetail from '@/components/DatastreamDetail'

export default {
  components: {
    DatastreamDetail,
    ValidationObserver
  },

  layout: 'editor',

  middleware: ['no-auth-redirect-home', 'check-org', 'reset-editing'],

  data: () => ({
    instance: null
  }),

  computed: {
    ...mapGetters(['org', 'datastream']),

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
    this.setEditorTitle('New datastream')
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
      create: 'datastreams/create'
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
        name: 'orgs-orgSlug-datastreams',
        params: { orgSlug: this.org.slug }
      })
    },

    edit() {
      this.setEditorDirty(0)
      this.setEditorTitle('Edit datastream')
      this.setEditing(true)
    },

    initInstance() {
      this.instance = {
        access_levels: {},
        attributes: {},
        datapoints_config: [],
        derived_from_datastream_ids: [],
        description: '',
        geo: null,
        geoCoordinates: {
          ele: null,
          lat: 0,
          lng: 0
        },
        involved_parties: [],
        is_enabled: true,
        is_geo_protected: false,
        is_hidden: false,
        name: '',
        organization_id: this.org._id,
        source_type: 'sensor',
        state: 'ready',
        station_id: null,
        terms: {},
        [this.$abilityTypeKey]: 'datastreams'
      }
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
            name: 'orgs-orgSlug-datastreams-datastreamId',
            params: { orgSlug: this.org.slug, datastreamId: res._id }
          },
          () => {
            this.$bus.$emit('edit-status', {
              type: 'success',
              message: 'Datastream created.' // TODO: Localize
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

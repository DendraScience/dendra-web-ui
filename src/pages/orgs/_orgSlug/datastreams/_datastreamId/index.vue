<template>
  <v-layout v-if="instance && org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout v-if="!editing">
          <v-flex>
            <h4 class="display-1 font-weight-light mb-2">Datastream details</h4>
          </v-flex>
        </v-layout>

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
import DatastreamDetail from '@/components/DatastreamDetail'

export default {
  components: {
    DatastreamDetail,
    ValidationObserver
  },

  layout: 'editor',

  middleware: ['check-org', 'check-datastream', 'reset-editing'],

  data: () => ({
    instance: null
  }),

  computed: {
    ...mapGetters(['org', 'datastream']),

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
      fetchDatastreams: 'datastreams/find',
      patch: 'datastreams/patch'
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
      this.setEditorTitle('Edit datastream')
      this.setEditing(true)
    },

    initInstance() {
      const coordinates = this.datastream.geo
        ? this.datastream.geo.coordinates
        : [0, 0, null]

      this.instance = _merge(
        {
          access_levels: {},
          attributes: {},
          datapoints_config: [],
          derived_from_datastream_ids: [],
          geo: null,
          geoCoordinates: {
            ele: coordinates[2],
            lat: coordinates[1],
            lng: coordinates[0]
          },
          involved_parties: [],
          terms: {}
        },
        this.datastream
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
        this.$store.commit('datastreams/removeItem', instance._id)

        await this.patch([instance._id, data, {}])
        await this.fetchDatastreams({ query: { _id: instance._id } })

        this.setEditing(false)
        this.setEditorDirty(-1)
        this.initInstance()
        this.$bus.$emit('edit-status', {
          type: 'success',
          message: 'Datastream saved.' // TODO: Localize
        })
      } catch (err) {
        this.$bus.$emit('edit-status', { type: 'error', message: err.message })
      }
    }
  }
}
</script>

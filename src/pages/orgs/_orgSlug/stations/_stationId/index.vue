<template>
  <v-layout v-if="instance && org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout v-if="!editing">
          <v-flex>
            <h4 class="display-1 font-weight-light mb-2">Station details</h4>
          </v-flex>
        </v-layout>

        <v-layout column>
          <v-flex>
            <station-detail v-model="instance" :editing="editing" :org="org" />
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
import _merge from 'lodash/merge'
import _pickBy from 'lodash/pickBy'
import _reduce from 'lodash/reduce'
import { timeZoneOffsets } from '@/lib/time-zone'
import StationDetail from '@/components/StationDetail'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    StationDetail
  },

  layout: 'editor',

  middleware: ['check-org', 'check-station', 'reset-editing'],

  data: () => ({
    instance: null
  }),

  computed: {
    ...mapGetters(['org', 'station']),

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
      fetchStations: 'stations/find',
      patch: 'stations/patch'
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
      this.setEditorTitle('Edit station')
      this.setEditing(true)
    },

    initInstance() {
      const coordinates = this.station.geo
        ? this.station.geo.coordinates
        : [0, 0, null]

      this.instance = _merge(
        {
          access_levels: {},
          external_links: [],
          // general_config: {},
          geo: null,
          geoCoordinates: {
            ele: coordinates[2],
            lat: coordinates[1],
            lng: coordinates[0]
          }
          // involved_parties: [],
          // media: [],
          // thing_ids: [],
          // thing_type_ids: []
        },
        this.station
      )
    },

    onCancel() {
      this.setEditing(false)
      this.setEditorDirty(-1)
      this.initInstance()
    },

    async onSave() {
      if (!(await this.$validator.validateAll())) return

      const { instance } = this

      const arrays = [
        'external_links',
        'involved_parties',
        'media',
        'thing_ids',
        'thing_type_ids'
      ]
      const fields = [
        'description',
        'full_name',
        'is_active',
        'is_enabled',
        'is_hidden',
        'is_geo_protected',
        'is_stationary',
        'name',
        'slug',
        'state',
        'time_zone'
      ]
      const objects = ['access_levels', 'geo']

      const $set = _pickBy(instance, (value, key) => {
        return (
          (arrays.includes(key) && value && value.length) ||
          (objects.includes(key) && value && Object.keys(value).length) ||
          fields.includes(key)
        )
      })
      if ($set.geo) {
        const { geoCoordinates } = instance
        $set.geo.coordinates = [geoCoordinates.lng, geoCoordinates.lat]
        if (typeof geoCoordinates.ele === 'number')
          $set.geo.coordinates.push(geoCoordinates.ele)
      }
      $set.utc_offset = timeZoneOffsets[$set.time_zone]

      const $unset = _reduce(
        instance,
        (result, value, key) => {
          if (
            (arrays.includes(key) && (!value || value.length === 0)) ||
            (objects.includes(key) &&
              (!value || Object.keys(value).length === 0))
          )
            result[key] = ''
          return result
        },
        {}
      )

      try {
        // HACK: Ensure that we have a fresh model afterwards
        this.$store.commit('stations/removeItem', instance._id)

        await this.patch([instance._id, { $set, $unset }, {}])
        await this.fetchStations({ query: { _id: instance._id } })

        this.setEditing(false)
        this.setEditorDirty(-1)
        this.initInstance()
        this.$bus.$emit('edit-status', {
          type: 'success',
          message: 'Station saved.' // TODO: Localize
        })
      } catch (err) {
        this.$bus.$emit('edit-status', { type: 'error', message: err.message })
      }
    }
  }
}
</script>

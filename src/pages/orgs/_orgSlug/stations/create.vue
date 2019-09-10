<template>
  <v-layout v-if="instance && org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout column>
          <v-flex>
            <station-detail v-model="instance" :editing="editing" :org="org" />
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import _pickBy from 'lodash/pickBy'
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

  middleware: ['no-auth-redirect-home', 'check-org', 'reset-editing'],

  data: () => ({
    instance: null
  }),

  computed: {
    ...mapGetters(['org', 'station']),

    ...mapState(['auth']),
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
    this.setEditorTitle('New station')
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
      create: 'stations/create'
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
        name: 'orgs-orgSlug-stations',
        params: { orgSlug: this.org.slug }
      })
    },

    edit() {
      this.setEditorDirty(0)
      this.setEditorTitle('Edit station')
      this.setEditing(true)
    },

    initInstance() {
      this.instance = {
        access_levels: {},
        description: '',
        external_links: [],
        full_name: '',
        // general_config: {},
        geo: null,
        geoCoordinates: {
          ele: null,
          lat: 0,
          lng: 0
        },
        // involved_parties: [],
        is_active: true,
        is_enabled: true,
        is_geo_protected: false,
        is_hidden: false,
        is_stationary: true,
        // media: [],
        name: '',
        organization_id: this.org._id,
        slug: 'new-station',
        state: 'ready',
        // thing_ids: [],
        // thing_type_ids: [],
        time_zone: 'PST',
        [this.$abilityTypeKey]: 'stations'
      }
    },

    async save() {
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
        'is_geo_protected',
        'is_hidden',
        'is_stationary',
        'name',
        'organization_id',
        'slug',
        'state',
        'time_zone'
      ]
      const objects = ['access_levels', 'geo']

      const data = _pickBy(instance, (value, key) => {
        return (
          (arrays.includes(key) && value && value.length) ||
          (objects.includes(key) && value && Object.keys(value).length) ||
          fields.includes(key)
        )
      })
      data.utc_offset = timeZoneOffsets[data.time_zone]

      try {
        const res = await this.create([data, {}])

        this.setEditing(false)
        this.setEditorDirty(-1)
        this.$router.push(
          {
            name: 'orgs-orgSlug-stations-stationId',
            params: { orgSlug: this.org.slug, stationId: res._id }
          },
          () => {
            this.$bus.$emit('edit-status', {
              type: 'success',
              message: 'Station created.' // TODO: Localize
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

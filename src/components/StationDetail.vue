<template>
  <v-container fluid pa-0>
    <v-layout column>
      <v-flex>
        <v-card>
          <v-container fluid>
            <v-layout column>
              <v-flex pb-0>
                <v-text-field
                  v-model.trim="value.name"
                  v-validate="'required|min:5|max:100'"
                  :error-messages="errors.collect('name')"
                  :readonly="!editing"
                  data-vv-name="name"
                  label="Name"
                  required
                ></v-text-field>

                <v-text-field
                  v-model.trim="value.full_name"
                  v-validate="'min:5|max:100'"
                  :error-messages="errors.collect('full_name')"
                  :readonly="!editing"
                  data-vv-name="full_name"
                  label="Full name"
                ></v-text-field>

                <v-text-field
                  v-model.trim="value.slug"
                  v-validate="{
                    regex: /^[a-z][a-z0-9-]{2,}[a-z0-9]$/,
                    required: true,
                    min: 5,
                    max: 50
                  }"
                  :error-messages="errors.collect('slug')"
                  :readonly="!editing"
                  data-vv-name="slug"
                  label="Slug"
                  required
                ></v-text-field>

                <v-select
                  v-model="value.state"
                  :items="stateItems"
                  :readonly="!editing"
                  label="State"
                ></v-select>

                <v-layout row>
                  <v-flex>
                    <v-select
                      v-model="value.time_zone"
                      :items="timeZoneItems"
                      :readonly="!editing"
                      label="Time zone"
                    ></v-select>
                  </v-flex>

                  <v-flex>
                    <v-text-field
                      :value="utcOffset"
                      disabled
                      label="UTC offset (seconds)"
                    ></v-text-field>
                  </v-flex>
                </v-layout>

                <v-textarea
                  v-model.trim="value.description"
                  v-validate="'min:5|max:5000'"
                  :error-messages="errors.collect('description')"
                  :readonly="!editing"
                  auto-grow
                  data-vv-name="description"
                  label="Description"
                ></v-textarea>
              </v-flex>
            </v-layout>

            <standard-options :editing="editing" :value="value" />
            <standard-audit v-if="!editing" :value="value" />
            <standard-identifier :value="value" />
          </v-container>
        </v-card>
      </v-flex>

      <v-flex v-if="!editing">
        <v-layout wrap>
          <v-flex>
            <datastream-total
              :is-enabled="true"
              :org="org"
              :station-id="value._id"
              hide-actions
              total-label="enabled"
            />
          </v-flex>

          <v-flex v-if="$can('create', 'datastreams')">
            <datastream-total
              :is-enabled="false"
              :org="org"
              :station-id="value._id"
              hide-actions
              total-label="disabled"
            />
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex>
        <detail-geo-point
          :editing="editing"
          :value="value"
          @add="addGeoCoordinates"
          @remove="removeGeoCoordinates"
        />
      </v-flex>

      <v-flex>
        <detail-access-levels
          :editing="editing"
          :value="value"
          @add="addAccessLevel"
          @edit="editAccessLevel"
          @remove="removeAccessLevel"
        />
      </v-flex>

      <v-flex>
        <detail-external-links
          :editing="editing"
          :value="value"
          @add="addExternalLink"
          @edit="editExternalLink"
          @remove="removeExternalLink"
        />
      </v-flex>

      <!-- TODO: Implement editing later! -->
      <v-flex v-if="!editing">
        <detail-external-refs :editing="editing" :value="value" />
      </v-flex>
    </v-layout>

    <detail-dialog
      ref="accessLevelDialog"
      v-model="accessLevel"
      @commit="commitAccessLevel"
    >
      <template v-slot:title
        >Specify access level</template
      >
      <template>
        <access-level-fields v-model="accessLevel" />
      </template>
    </detail-dialog>

    <detail-dialog
      ref="externalLinkDialog"
      v-model="externalLink"
      @commit="commitExternalLink"
    >
      <template v-slot:title
        >Specify external link</template
      >
      <template>
        <external-link-fields v-model="externalLink" />
      </template>
    </detail-dialog>
  </v-container>
</template>

<script>
import { timeZoneItems, timeZoneOffsets } from '@/lib/time-zone'
import AccessLevelFields from '@/components/AccessLevelFields'
import DatastreamTotal from '@/components/DatastreamTotal'
import DetailAccessLevels from '@/components/DetailAccessLevels'
import DetailDialog from '@/components/DetailDialog'
import DetailExternalLinks from '@/components/DetailExternalLinks'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import DetailGeoPoint from '@/components/DetailGeoPoint'
import ExternalLinkFields from '@/components/ExternalLinkFields'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'

export default {
  components: {
    AccessLevelFields,
    DatastreamTotal,
    DetailAccessLevels,
    DetailDialog,
    DetailExternalLinks,
    DetailExternalRefs,
    ExternalLinkFields,
    DetailGeoPoint,
    StandardAudit,
    StandardIdentifier,
    StandardOptions
  },

  inject: ['$validator'],

  props: {
    editing: { default: false, type: Boolean },
    org: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    accessLevel: {
      dialog: false
    },
    externalLink: {
      dialog: false
    },

    stateItems: ['pending', 'ready'],

    timeZoneItems
  }),

  computed: {
    utcOffset() {
      return this.editing
        ? timeZoneOffsets[this.value.time_zone]
        : this.value.utc_offset
    }
  },

  methods: {
    addAccessLevel({ key, target }) {
      this.$refs.accessLevelDialog.$validator.reset()

      this.accessLevel = {
        dialog: true,
        key,
        level: 1,
        target
      }
    },

    addExternalLink() {
      this.$refs.externalLinkDialog.$validator.reset()

      this.externalLink = {
        dialog: true,
        title: null,
        url: null
      }
    },

    addGeoCoordinates() {
      this.value.geo = {
        type: 'Point'
      }
    },

    editAccessLevel({ key, target }) {
      this.$refs.accessLevelDialog.$validator.reset()

      this.accessLevel = {
        dialog: true,
        key,
        level: this.value.access_levels[key],
        target
      }
    },

    editExternalLink(item) {
      this.$refs.externalLinkDialog.$validator.reset()

      this.externalLink = Object.assign({ dialog: true }, item)
    },

    commitAccessLevel({ key, level }) {
      const { value } = this

      const newLevels = Object.assign({}, value.access_levels, {
        [key]: level
      })

      value.access_levels = newLevels

      this.accessLevel.dialog = false
    },

    commitExternalLink({ key, title, url }) {
      const { value } = this

      if (key === undefined) {
        value.external_links.push({
          title,
          url
        })
      } else {
        value.external_links = value.external_links.map((item, index) => {
          return index === key
            ? {
                title,
                url
              }
            : item
        })
      }

      this.externalLink.dialog = false
    },

    removeAccessLevel({ key }) {
      const { value } = this

      const newLevels = Object.assign({}, value.access_levels)
      delete newLevels[key]

      value.access_levels = newLevels

      this.accessLevel.dialog = false
    },

    removeExternalLink({ key }) {
      this.value.external_links = this.value.external_links.filter(
        (interval, index) => index !== key
      )
    },

    removeGeoCoordinates() {
      this.value.geo = null
    }
  }
}
</script>

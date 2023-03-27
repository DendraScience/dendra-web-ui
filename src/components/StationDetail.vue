<template>
  <v-row>
    <v-col>
      <v-row>
        <v-col>
          <v-card>
            <v-container fluid>
              <v-row>
                <v-col>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="name"
                    rules="required|min:1|max:100"
                  >
                    <v-text-field
                      v-model.trim="value.name"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Name"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="full name"
                    rules="min:1|max:100"
                  >
                    <v-text-field
                      v-model.trim="value.full_name"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Full name"
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="slug"
                    :rules="{
                      regex: /^[a-z][a-z0-9-]{2,}[a-z0-9]$/,
                      required: true,
                      min: 1,
                      max: 50
                    }"
                  >
                    <v-text-field
                      v-model.trim="value.slug"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Slug"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <v-select
                    v-model="value.state"
                    :items="stateItems"
                    :readonly="!editing"
                    label="State"
                  ></v-select>

                  <v-row dense>
                    <v-col>
                      <v-select
                        v-model="value.time_zone"
                        :items="timeZoneItems"
                        :readonly="!editing"
                        item-text="text"
                        item-value="abbr"
                        label="Time zone"
                      ></v-select>
                    </v-col>

                    <v-col>
                      <v-text-field
                        :value="utcOffset"
                        disabled
                        label="UTC offset (seconds)"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="description"
                    rules="min:5|max:5000"
                  >
                    <v-textarea
                      v-model.trim="value.description"
                      :error-messages="errors"
                      :readonly="!editing"
                      auto-grow
                      label="Description"
                    ></v-textarea>
                  </ValidationProvider>
                </v-col>
              </v-row>

              <standard-options
                :editing="editing"
                :value="value"
                as="stations"
              />
              <standard-audit v-if="!editing" :value="value" />
              <standard-identifier :value="value" />
            </v-container>

            <v-card-actions v-if="!editing">
              <v-btn
                :to="{
                  name: 'orgs-orgSlug-status-stationSlug',
                  params: {
                    orgSlug: org.slug,
                    stationSlug: value.slug
                  }
                }"
                dark
                nuxt
                ><v-icon left flat>{{ mdiViewDashboard }}</v-icon
                >Station Dashboard</v-btn
              >
              <v-btn
                :to="{
                  name: 'orgs-orgSlug-datastreams',
                  params: {
                    orgSlug: org.slug
                  },
                  query: {
                    faceted: true,
                    scheme: 'dq',
                    selectStationId: value._id
                  }
                }"
                dark
                nuxt
                ><v-icon left flat>{{ mdiChartMultiple }}</v-icon
                >Data Query</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="!editing">
        <v-col cols="12" md="6">
          <datastream-total
            :is-enabled="true"
            :org="org"
            :show-hidden="$canCreate('datastreams', org)"
            :station-id="value._id"
            hide-actions
            total-label="enabled"
          />
        </v-col>

        <v-col v-if="$canCreate('datastreams', org)" cols="12" md="6">
          <datastream-total
            :is-enabled="false"
            :org="org"
            :show-hidden="true"
            :station-id="value._id"
            hide-actions
            total-label="disabled"
          />
        </v-col>

        <v-col cols="12" md="6">
          <annotation-total
            :is-enabled="true"
            :org="org"
            :show-hidden="$canCreate('annotations', org)"
            :station-id="value._id"
            hide-actions
            total-label="enabled"
          />
        </v-col>

        <v-col v-if="$canCreate('annotations', org)" cols="12" md="6">
          <annotation-total
            :is-enabled="false"
            :org="org"
            :show-hidden="true"
            :station-id="value._id"
            hide-actions
            total-label="disabled"
          />
        </v-col>
      </v-row>

      <v-row v-if="!editing && mediaImages.length">
        <v-col>
          <detail-images :items="mediaImages">{{
            value.full_name || value.name
          }}</detail-images>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <detail-geo-point
            :editing="editing"
            :value="value"
            @add="addGeoPoint"
            @remove="removeGeo"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <detail-general-config
            :editing="editing"
            :value="value"
            @add="addGeneralConfig"
            @edit="editGeneralConfig"
            @remove="removeGeneralConfig"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <detail-access-levels
            :editing="editing"
            :value="value"
            @add="addAccessLevel"
            @edit="editAccessLevel"
            @remove="removeAccessLevel"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <detail-members
            :editing="editing"
            :value="value"
            @add="addMember"
            @edit="editMember"
            @remove="removeMember"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <detail-external-links
            :editing="editing"
            :value="value"
            @add="addExternalLink"
            @edit="editExternalLink"
            @remove="removeExternalLink"
          />
        </v-col>
      </v-row>

      <!-- TODO: Implement editing later! -->
      <v-row>
        <v-col>
          <detail-external-refs
            :editing="editing"
            :value="value"
            @add="addExternalReference"
            @edit="editExternalReference"
            @remove="removeExternalReference"
          />
        </v-col>
      </v-row>

      <detail-dialog
        ref="generalConfigDialog"
        v-model="generalConfig"
        max-width="800"
        @commit="commitGeneralConfig"
      >
        <template #title>Specify configuration</template>
        <template #default>
          <general-config-fields
            v-model="generalConfig"
            :settings-resolved="configSettingsResolved"
          />
        </template>
      </detail-dialog>

      <detail-dialog
        ref="accessLevelDialog"
        v-model="accessLevel"
        @commit="commitAccessLevel"
      >
        <template #title>Specify access level</template>
        <template #default>
          <access-level-fields v-model="accessLevel" />
        </template>
      </detail-dialog>

      <detail-dialog ref="memberDialog" v-model="member" @commit="commitMember">
        <template #title>Specify member</template>
        <template #default>
          <member-role-fields
            v-model="member"
            :org="org"
            :select-disabled="member.selectDisabled"
          />
        </template>
      </detail-dialog>

      <detail-dialog
        ref="externalLinkDialog"
        v-model="externalLink"
        @commit="commitExternalLink"
      >
        <template #title>Specify external link</template>
        <template #default>
          <external-link-fields v-model="externalLink" />
        </template>
      </detail-dialog>

      <detail-dialog
        ref="externalRefDialog"
        v-model="externalReference"
        @commit="commitExternalReference"
      >
        <template #title>Specify external reference</template>
        <template #default>
          <external-reference-fields
            v-model="externalReference"
            :type-resolved="externalRefTypeResolved"
          />
        </template>
      </detail-dialog>
    </v-col>
  </v-row>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import accessLevel from '@/mixins/access-level'
import externalLink from '@/mixins/external-link'
import externalReference from '@/mixins/external-reference'
import generalConfig from '@/mixins/general-config'
import geo from '@/mixins/geo'
import member from '@/mixins/member'
import { timeZoneItems, timeZoneOffsets } from '@/lib/time-zone'
import AccessLevelFields from '@/components/AccessLevelFields'
import AnnotationTotal from '@/components/AnnotationTotal'
import DatastreamTotal from '@/components/DatastreamTotal'
import DetailAccessLevels from '@/components/DetailAccessLevels'
import DetailDialog from '@/components/DetailDialog'
import DetailExternalLinks from '@/components/DetailExternalLinks'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import DetailGeneralConfig from '@/components/DetailGeneralConfig'
import DetailGeoPoint from '@/components/DetailGeoPoint'
import DetailImages from '@/components/DetailImages'
import DetailMembers from '@/components/DetailMembers'
import ExternalLinkFields from '@/components/ExternalLinkFields'
import ExternalReferenceFields from '@/components/ExternalReferenceFields'
import GeneralConfigFields from '@/components/GeneralConfigFields'
import MemberRoleFields from '@/components/MemberRoleFields'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'

export default {
  components: {
    AccessLevelFields,
    AnnotationTotal,
    DatastreamTotal,
    DetailAccessLevels,
    DetailDialog,
    DetailExternalLinks,
    DetailExternalRefs,
    DetailGeneralConfig,
    DetailGeoPoint,
    DetailImages,
    DetailMembers,
    ExternalLinkFields,
    ExternalReferenceFields,
    GeneralConfigFields,
    MemberRoleFields,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    ValidationProvider
  },

  mixins: [
    accessLevel,
    externalLink,
    externalReference,
    generalConfig,
    geo,
    member
  ],

  props: {
    editing: { default: false, type: Boolean },
    org: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    member: {
      roles: [
        {
          text: 'admin'
        },
        {
          text: 'contact'
        },
        {
          text: 'manager'
        }
      ]
    },

    stateItems: ['pending', 'ready', 'disconnected'],

    timeZoneItems
  }),

  computed: {
    media() {
      return this.value.media || []
    },

    mediaImages() {
      return this.media
        .filter(media => media.type === 'photo')
        .map(media => ({ url: media.sizes.medium.url }))
    },

    utcOffset() {
      return this.editing
        ? timeZoneOffsets[this.value.time_zone]
        : this.value.utc_offset
    }
  }
}
</script>

<template>
  <v-container fluid pa-0>
    <v-layout column>
      <v-flex>
        <v-card>
          <v-container fluid>
            <v-layout column>
              <v-flex pb-0>
                <ValidationProvider
                  v-slot="{ errors }"
                  name="name"
                  rules="required|min:5|max:100"
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
                  rules="min:5|max:100"
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
                    min: 5,
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
          @add="addGeoPoint"
          @remove="removeGeo"
        />
      </v-flex>

      <v-flex>
        <detail-general-config
          :editing="editing"
          :value="value"
          @add="addGeneralConfig"
          @edit="editGeneralConfig"
          @remove="removeGeneralConfig"
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
        <detail-members
          :editing="editing"
          :value="value"
          @add="addMember"
          @edit="editMember"
          @remove="removeMember"
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
      ref="generalConfigDialog"
      v-model="generalConfig"
      max-width="800"
      @commit="commitGeneralConfig"
    >
      <template v-slot:title>Specify configuration</template>
      <template>
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
      <template v-slot:title>Specify access level</template>
      <template>
        <access-level-fields v-model="accessLevel" />
      </template>
    </detail-dialog>

    <detail-dialog ref="memberDialog" v-model="member" @commit="commitMember">
      <template v-slot:title>Specify member</template>
      <template>
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
      <template v-slot:title>Specify external link</template>
      <template>
        <external-link-fields v-model="externalLink" />
      </template>
    </detail-dialog>
  </v-container>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import accessLevel from '@/mixins/access-level'
import externalLink from '@/mixins/external-link'
import generalConfig from '@/mixins/general-config'
import geo from '@/mixins/geo'
import member from '@/mixins/member'
import { timeZoneItems, timeZoneOffsets } from '@/lib/time-zone'
import AccessLevelFields from '@/components/AccessLevelFields'
import DatastreamTotal from '@/components/DatastreamTotal'
import DetailAccessLevels from '@/components/DetailAccessLevels'
import DetailDialog from '@/components/DetailDialog'
import DetailExternalLinks from '@/components/DetailExternalLinks'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import DetailGeneralConfig from '@/components/DetailGeneralConfig'
import DetailGeoPoint from '@/components/DetailGeoPoint'
import DetailMembers from '@/components/DetailMembers'
import ExternalLinkFields from '@/components/ExternalLinkFields'
import GeneralConfigFields from '@/components/GeneralConfigFields'
import MemberRoleFields from '@/components/MemberRoleFields'
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
    DetailGeneralConfig,
    DetailGeoPoint,
    DetailMembers,
    ExternalLinkFields,
    GeneralConfigFields,
    MemberRoleFields,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    ValidationProvider
  },

  mixins: [accessLevel, externalLink, generalConfig, geo, member],

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

    stateItems: ['pending', 'ready'],
    timeZoneItems
  }),

  computed: {
    utcOffset() {
      return this.editing
        ? timeZoneOffsets[this.value.time_zone]
        : this.value.utc_offset
    }
  }
}
</script>

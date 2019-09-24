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

                <v-select
                  v-model="value.source_type"
                  :items="sourceTypeItems"
                  :readonly="!editing"
                  label="Source type"
                ></v-select>

                <v-select
                  v-model="value.state"
                  :items="stateItems"
                  :readonly="!editing"
                  label="State"
                ></v-select>

                <feathers-vuex-find
                  v-slot="{ isFindPending: loading, items: stations }"
                  :query="{
                    is_hidden: false,
                    organization_id: org._id,
                    station_type: 'weather',
                    $sort: { name: 1 }
                  }"
                  service="stations"
                >
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="station"
                    rules="required"
                  >
                    <v-select
                      v-model="value.station_id"
                      :error-messages="errors"
                      :items="stations"
                      :label="loading ? 'Loading...' : 'Station'"
                      :loading="loading"
                      :readonly="!editing"
                      item-text="longName"
                      item-value="_id"
                    ></v-select>
                  </ValidationProvider>
                </feathers-vuex-find>

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
                    data-vv-name="description"
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

      <v-flex>
        <detail-geo-point
          :editing="editing"
          :value="value"
          @add="addGeoPoint"
          @remove="removeGeo"
        />
      </v-flex>

      <v-flex>
        <detail-attributes
          :editing="editing"
          :value="value"
          @add="addAttribute"
          @edit="editAttribute"
          @remove="removeAttribute"
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

      <!-- TODO: Implement editing later! -->
      <v-flex v-if="!editing">
        <detail-external-refs :editing="editing" :value="value" />
      </v-flex>
    </v-layout>

    <detail-dialog
      ref="attributeDialog"
      v-model="attribute"
      @commit="commitAttribute"
    >
      <template v-slot:title
        >Specify attribute</template
      >
      <template>
        <attribute-fields
          v-model="attribute"
          :key-disabled="attribute.keyDisabled"
        />
      </template>
    </detail-dialog>

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

    <detail-dialog ref="memberDialog" v-model="member" @commit="commitMember">
      <template v-slot:title
        >Specify member</template
      >
      <template>
        <member-role-fields
          v-model="member"
          :org="org"
          :select-disabled="member.selectDisabled"
        />
      </template>
    </detail-dialog>
  </v-container>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import accessLevel from '@/mixins/access-level'
import attribute from '@/mixins/attribute'
import geo from '@/mixins/geo'
import member from '@/mixins/member'
import AccessLevelFields from '@/components/AccessLevelFields'
import AttributeFields from '@/components/AttributeFields'
import DetailAccessLevels from '@/components/DetailAccessLevels'
import DetailAttributes from '@/components/DetailAttributes'
import DetailDialog from '@/components/DetailDialog'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import DetailGeoPoint from '@/components/DetailGeoPoint'
import DetailMembers from '@/components/DetailMembers'
import MemberRoleFields from '@/components/MemberRoleFields'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'

export default {
  components: {
    AccessLevelFields,
    AttributeFields,
    DetailAccessLevels,
    DetailAttributes,
    DetailDialog,
    DetailExternalRefs,
    DetailGeoPoint,
    DetailMembers,
    MemberRoleFields,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    ValidationProvider
  },

  mixins: [accessLevel, attribute, geo, member],

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

    sourceTypeItems: ['sensor'],
    stateItems: ['pending', 'ready']
  })
}
</script>

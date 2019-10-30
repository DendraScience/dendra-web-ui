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
        <detail-terms
          :editing="editing"
          :value="value"
          @add="addTerms"
          @edit="editTerms"
          @remove="removeTerms"
        />
      </v-flex>

      <v-flex>
        <detail-datapoints-config
          :editing="editing"
          :value="value"
          @add="addDatapointsConfig"
          @edit="editDatapointsConfig"
          @remove="removeDatapointsConfig"
        />
      </v-flex>

      <v-flex>
        <datastream-detail-derived
          :editing="editing"
          :value="value"
          @add="addDerived"
          @remove="removeDerived"
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

    <v-dialog
      v-model="datastreamDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="datastreamDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Select derived datastreams</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="datastreamDialogCommit">OK</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <datastream-search :org="org" show-disabled>
          <template v-slot:select="{ item }">
            <v-icon
              color="primary"
              @click="
                incrementQuantity({
                  id: item._id,
                  max: 1
                })
              "
              >{{
                item.quantitySelected ? 'check_box' : 'check_box_outline_blank'
              }}</v-icon
            >
          </template>
        </datastream-search>
      </v-card>
    </v-dialog>

    <detail-dialog ref="termsDialog" v-model="terms" @commit="commitTerms">
      <template v-slot:title
        >Specify terms</template
      >
      <template>
        <terms-fields v-model="terms" />
      </template>
    </detail-dialog>

    <detail-dialog
      ref="datapointsConfigDialog"
      v-model="datapointsConfig"
      max-width="800"
      @commit="commitDatapointsConfig"
    >
      <template v-slot:title
        >Specify configuration</template
      >
      <template>
        <datapoints-config-fields
          v-model="datapointsConfig"
          :date-range-resolved="configDateRangeResolved"
          :params-resolved="configParamsResolved"
          :path-items="configPathItems"
        >
          <template v-slot:expression="{ value }">
            <evaluate-action-fields
              v-model="value"
              :attributes-resolved="configAttributesResolved"
              :datapoint-resolved="configDatapointResolved"
              :expr-resolved="configExprResolved"
              :required="false"
              :result-resolved="configResultResolved"
            />
          </template>
        </datapoints-config-fields>
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
import _union from 'lodash/union'
import { mapGetters, mapMutations } from 'vuex'
import { ValidationProvider } from 'vee-validate'
import accessLevel from '@/mixins/access-level'
import attribute from '@/mixins/attribute'
import datapointsConfig from '@/mixins/datapoints-config'
import geo from '@/mixins/geo'
import member from '@/mixins/member'
import terms from '@/mixins/terms'
import AccessLevelFields from '@/components/AccessLevelFields'
import AttributeFields from '@/components/AttributeFields'
import DatapointsConfigFields from '@/components/DatapointsConfigFields'
import DatastreamDetailDerived from '@/components/DatastreamDetailDerived'
import DatastreamSearch from '@/components/DatastreamSearch'
import DetailAccessLevels from '@/components/DetailAccessLevels'
import DetailAttributes from '@/components/DetailAttributes'
import DetailDatapointsConfig from '@/components/DetailDatapointsConfig'
import DetailDialog from '@/components/DetailDialog'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import DetailGeoPoint from '@/components/DetailGeoPoint'
import DetailMembers from '@/components/DetailMembers'
import DetailTerms from '@/components/DetailTerms'
import EvaluateActionFields from '@/components/EvaluateActionFields'
import MemberRoleFields from '@/components/MemberRoleFields'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'
import TermsFields from '@/components/TermsFields'

export default {
  components: {
    AccessLevelFields,
    AttributeFields,
    DatapointsConfigFields,
    DatastreamDetailDerived,
    DatastreamSearch,
    DetailAccessLevels,
    DetailAttributes,
    DetailDatapointsConfig,
    DetailDialog,
    DetailExternalRefs,
    DetailGeoPoint,
    DetailMembers,
    DetailTerms,
    EvaluateActionFields,
    MemberRoleFields,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    TermsFields,
    ValidationProvider
  },

  mixins: [accessLevel, attribute, datapointsConfig, geo, member, terms],

  props: {
    editing: { default: false, type: Boolean },
    org: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    datastreamDialog: false,

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

    configPathItems: [
      {
        spec: {
          required: [
            'query.api',
            'query.db',
            'query.fc',
            'query.sc',
            'query.coalesce',
            'query.utc_offset'
          ],
          sample: {
            query: {
              api: 'org',
              db: 'station_name',
              fc: 'source_tenmin',
              sc: '"time", "Field_Name"',
              utc_offset: -28800,
              coalesce: false
            }
          }
        },
        text: 'Influx SELECT',
        value: '/influx/select'
      },
      {
        spec: {
          required: ['query.datastream_id', 'query.time_adjust'],
          sample: {
            query: {
              datastream_id: 1234,
              time_adjust: -28800
            }
          }
        },
        text: 'Legacy datavalues2',
        value: '/legacy/datavalues2'
      },
      {
        spec: {
          required: ['query.datastream_id', 'query.time_adjust'],
          sample: {
            query: {
              datastream_id: 1234,
              time_adjust: -28800
            }
          }
        },
        text: 'Legacy datavalues-ucnrs',
        value: '/legacy/datavalues-ucnrs'
      }
    ],
    sourceTypeItems: ['datastream', 'sensor'],
    stateItems: ['pending', 'ready']
  }),

  computed: {
    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids'
    })
  },

  methods: {
    ...mapMutations({
      incrementQuantity: 'cart/incrementQuantity',
      resetCart: 'cart/reset'
    }),

    addDerived(item) {
      this.resetCart()

      this.datastreamDialog = true
    },

    removeDerived(item) {
      const key = 'derived_from_datastream_ids'
      const ids = this.value[key]

      this.$set(this.value, key, ids.filter(id => id !== item.id))
    },

    datastreamDialogCommit() {
      this.$set(
        this.value,
        'derived_from_datastream_ids',
        _union(this.value.derived_from_datastream_ids, this.cartIds)
      )

      this.datastreamDialog = false
    }
  }
}
</script>

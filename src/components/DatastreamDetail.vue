<template>
  <v-container fluid pa-0>
    <v-row>
      <v-col>
        <v-card>
          <v-container fluid pt-0>
            <v-row>
              <v-col>
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
                      :item-text="
                        station =>
                          station.is_enabled
                            ? station.name
                            : `${station.name} (disabled)`
                      "
                      :items="stations"
                      :label="loading ? 'Loading...' : 'Station'"
                      :loading="loading"
                      :readonly="!editing"
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
              </v-col>
            </v-row>

            <standard-options
              :editing="editing"
              :value="value"
              as="datastreams"
            />
            <standard-audit v-if="!editing" :value="value" />
            <standard-identifier :value="value" />
          </v-container>

          <v-card-actions v-if="!editing" class="flex-wrap">
            <v-btn
              :to="{
                name: 'orgs-orgSlug-stations-stationId',
                params: {
                  orgSlug: org.slug,
                  stationId: value.station_id
                }
              }"
              color="green"
              dark
              nuxt
              ><v-icon left>{{ mdiNature }}</v-icon
              >Station Details</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!editing">
      <v-col cols="12" md="6">
        <annotation-total
          :datastream-id="value._id"
          :is-enabled="true"
          :org="org"
          :show-hidden="$canCreate('annotations', org)"
          hide-actions
          total-label="enabled"
        />
      </v-col>

      <v-col v-if="$canCreate('annotations', org)" cols="12" md="6">
        <annotation-total
          :datastream-id="value._id"
          :is-enabled="false"
          :org="org"
          :show-hidden="true"
          hide-actions
          total-label="disabled"
        />
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
        <detail-attributes
          :editing="editing"
          :value="value"
          @add="addAttribute"
          @edit="editAttribute"
          @remove="removeAttribute"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <detail-terms
          :editing="editing"
          :value="value"
          @add="addTerms"
          @edit="editTerms"
          @remove="removeTerms"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <detail-datapoints-config
          ref="detailDatapointsConfig"
          :editing="editing"
          :time-zone.sync="timeZone"
          :value="value"
          @add="addDatapointsConfig"
          @edit="editDatapointsConfig"
          @remove="removeDatapointsConfig"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <datastream-detail-derived
          :editing="editing"
          :value="value"
          @add="addDerived"
          @remove="removeDerived"
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

    <!-- TODO: Implement editing later! -->
    <v-row v-if="!editing">
      <v-col>
        <detail-external-refs :editing="editing" :value="value" />
      </v-col>
    </v-row>

    <detail-dialog
      ref="attributeDialog"
      v-model="attribute"
      @commit="commitAttribute"
    >
      <template v-slot:title>Specify attribute</template>
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
            <v-icon>{{ mdiClose }}</v-icon>
          </v-btn>
          <v-toolbar-title>Select derived datastreams</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="datastreamDialogCommit">OK</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <datastream-search
          :org="org"
          :station-id="value.station_id"
          show-disabled
          show-hidden
        >
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
                getQuantity(item._id)
                  ? mdiCheckboxMarked
                  : mdiCheckboxBlankOutline
              }}</v-icon
            >
          </template>
        </datastream-search>
      </v-card>
    </v-dialog>

    <detail-dialog ref="termsDialog" v-model="terms" @commit="commitTerms">
      <template v-slot:title>Specify terms</template>
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
        >{{ timeZoneAccepted ? 'Specify configuration' : 'Confirm time zone' }}
      </template>
      <template>
        <datapoints-config-fields
          v-if="timeZoneAccepted"
          v-model="datapointsConfig"
          :date-range-resolved="configDateRangeResolved"
          :params-resolved="configParamsResolved"
          :path-items="configPathItems"
        >
          <template v-slot:expression="expressionProps">
            <evaluate-action-fields
              v-model="expressionProps.value"
              :attributes-resolved="configAttributesResolved"
              :datapoint-resolved="configDatapointResolved"
              :expr-resolved="configExprResolved"
              :required="false"
              :result-resolved="configResultResolved"
            />
          </template>
        </datapoints-config-fields>

        <time-zone-picker v-else v-model="datapointsConfig.dateRange" />
      </template>
    </detail-dialog>

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
  </v-container>
</template>

<script>
import _union from 'lodash/union'
import { mapGetters, mapMutations } from 'vuex'
import { ValidationProvider } from 'vee-validate'
import accessLevel from '@/mixins/access-level'
import attribute from '@/mixins/attribute'
import datapointsConfig from '@/mixins/datapoints-config'
import generalConfig from '@/mixins/general-config'
import geo from '@/mixins/geo'
import member from '@/mixins/member'
import terms from '@/mixins/terms'
import AccessLevelFields from '@/components/AccessLevelFields'
import AnnotationTotal from '@/components/AnnotationTotal'
import AttributeFields from '@/components/AttributeFields'
import DatapointsConfigFields from '@/components/DatapointsConfigFields'
import DatastreamDetailDerived from '@/components/DatastreamDetailDerived'
import DatastreamSearch from '@/components/DatastreamSearch'
import DetailAccessLevels from '@/components/DetailAccessLevels'
import DetailAttributes from '@/components/DetailAttributes'
import DetailDatapointsConfig from '@/components/DetailDatapointsConfig'
import DetailDialog from '@/components/DetailDialog'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import DetailGeneralConfig from '@/components/DetailGeneralConfig'
import DetailGeoPoint from '@/components/DetailGeoPoint'
import DetailMembers from '@/components/DetailMembers'
import DetailTerms from '@/components/DetailTerms'
import EvaluateActionFields from '@/components/EvaluateActionFields'
import GeneralConfigFields from '@/components/GeneralConfigFields'
import MemberRoleFields from '@/components/MemberRoleFields'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'
import TermsFields from '@/components/TermsFields'
import TimeZonePicker from '@/components/TimeZonePicker'

export default {
  components: {
    AccessLevelFields,
    AnnotationTotal,
    AttributeFields,
    DatapointsConfigFields,
    DatastreamDetailDerived,
    DatastreamSearch,
    DetailAccessLevels,
    DetailAttributes,
    DetailDatapointsConfig,
    DetailDialog,
    DetailExternalRefs,
    DetailGeneralConfig,
    DetailGeoPoint,
    DetailMembers,
    DetailTerms,
    EvaluateActionFields,
    GeneralConfigFields,
    MemberRoleFields,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    TermsFields,
    TimeZonePicker,
    ValidationProvider
  },

  mixins: [
    accessLevel,
    attribute,
    datapointsConfig,
    generalConfig,
    geo,
    member,
    terms
  ],

  props: {
    editing: { default: false, type: Boolean },
    org: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data() {
    const { org } = this
    return {
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
            required: [],
            sample: {
              query: {}
            }
          },
          text: 'Dendra datapoints',
          value: '/dendra/datapoints'
        },
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
          text: 'Influx select',
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
      sourceTypeItems: ['deriver', 'sensor'],
      stateItems: ['pending', 'ready'],

      timeZone:
        (org.general_config && org.general_config.default_time_zone) || 'UTC'
    }
  },

  computed: {
    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids',
      getQuantity: 'cart/getQuantity'
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

      this.$set(
        this.value,
        key,
        ids.filter(id => id !== item.id)
      )
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

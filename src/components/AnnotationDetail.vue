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
                    name="title"
                    rules="required|min:1|max:100"
                  >
                    <v-text-field
                      v-model.trim="value.title"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Title"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <v-select
                    v-if="typeof value.state === 'string'"
                    v-model="value.state"
                    :items="stateItems"
                    :readonly="
                      !editing ||
                      $cannotAssign('annotations', value, '$set.state')
                    "
                    label="State"
                  ></v-select>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="description"
                    rules="required|min:5|max:5000"
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
                as="annotations"
              />
              <standard-audit v-if="!editing" :value="value" />
              <standard-identifier :value="value" />
            </v-container>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="!editing">
        <v-col cols="12" md="6">
          <station-total
            :annotation="value"
            :org="org"
            hide-actions
            show-disabled
            show-hidden
          />
        </v-col>

        <v-col cols="12" md="6">
          <datastream-total
            :annotation="value"
            :org="org"
            hide-actions
            show-disabled
            show-hidden
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <annotation-detail-applies
            :editing="editing"
            :value="value"
            @add="addApplies"
            @remove="removeApplies"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <detail-intervals
            ref="detailIntervals"
            :editing="editing"
            :time-zone.sync="timeZone"
            :value="value"
            @add="addInterval"
            @edit="editInterval"
            @remove="removeInterval"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <annotation-detail-actions
            :editing="editing"
            :value="value"
            @add="addAction"
            @remove="removeAction"
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

      <v-dialog
        v-model="datastreamDialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card tile>
          <v-toolbar color="primary" dark flat>
            <v-btn icon dark @click="datastreamDialog = false">
              <v-icon>{{ mdiClose }}</v-icon>
            </v-btn>
            <v-toolbar-title>Select datastreams</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark text @click="datastreamDialogCommit">OK</v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <datastream-search :org="org" show-hidden show-disabled show-options>
            <template #select="{ item }">
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

      <detail-dialog
        ref="attribActionDialog"
        v-model="attribAction"
        @commit="commitAttribAction"
      >
        <template #title>Specify attribute</template>
        <template #default>
          <attrib-action-fields v-model="attribAction" />
        </template>
      </detail-dialog>

      <detail-dialog
        ref="evaluateActionDialog"
        v-model="evaluateAction"
        max-width="800"
        @commit="commitEvaluateAction"
      >
        <template #title>Specify expression</template>
        <template #default>
          <evaluate-action-fields
            v-model="evaluateAction"
            :attributes-resolved="evaluateAttributesResolved"
            :datapoint-resolved="evaluateDatapointResolved"
            :expr-resolved="evaluateExprResolved"
            :result-resolved="evaluateResultResolved"
          />
        </template>
      </detail-dialog>

      <detail-dialog
        ref="flagActionDialog"
        v-model="flagAction"
        @commit="commitFlagAction"
      >
        <template #title>Specify flag</template>
        <template #default>
          <flag-action-fields v-model="flagAction" />
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
        ref="momentIntervalDialog"
        v-model="momentInterval"
        max-width="380"
        @commit="commitMomentInterval"
      >
        <template #title>{{
          timeZoneAccepted ? 'Specify moment' : 'Confirm time zone'
        }}</template>
        <template #default>
          <ValidationProvider
            v-if="timeZoneAccepted"
            :rules="{
              resolved_valid: momentIntervalResolved
            }"
          >
            <date-range-picker
              v-model="momentInterval.dateRange"
              hide-to
              show-time
            >
              <template #footer>
                <div class="text-center">
                  <span class="font-weight-medium">
                    <span v-if="!momentIntervalResolved.valid">
                      Please specify a single point in time
                    </span>

                    <span v-else-if="momentIntervalResolved.from">
                      Occurred at
                      <date-chip
                        :time-zone="momentIntervalResolved.timeZone"
                        :utc-offset="momentIntervalResolved.utcOffset"
                        :value="momentIntervalResolved.from"
                        class="ma-1"
                        color="success"
                      />
                    </span>
                  </span>
                </div>
              </template>
            </date-range-picker>
          </ValidationProvider>

          <time-zone-picker v-else v-model="momentInterval.dateRange" />
        </template>
      </detail-dialog>

      <detail-dialog
        ref="rangeIntervalDialog"
        v-model="rangeInterval"
        @commit="commitRangeInterval"
      >
        <template #title
          >{{ timeZoneAccepted ? 'Specify range' : 'Confirm time zone' }}
        </template>
        <template #default>
          <ValidationProvider
            v-if="timeZoneAccepted"
            :rules="{
              resolved_valid: rangeIntervalResolved
            }"
          >
            <date-range-picker
              v-model="rangeInterval.dateRange"
              optional
              show-time
            >
              <template #footer>
                <div class="text-center">
                  <span class="font-weight-medium">
                    <span v-if="!rangeIntervalResolved.valid">
                      Please specify a begin and end time
                    </span>

                    <span
                      v-else-if="
                        rangeIntervalResolved.from && rangeIntervalResolved.to
                      "
                    >
                      Begins at
                      <date-chip
                        :time-zone="rangeIntervalResolved.timeZone"
                        :utc-offset="rangeIntervalResolved.utcOffset"
                        :value="rangeIntervalResolved.from"
                        class="ma-1"
                        color="success"
                      />
                      and ends before
                      <date-chip
                        :time-zone="rangeIntervalResolved.timeZone"
                        :utc-offset="rangeIntervalResolved.utcOffset"
                        :value="rangeIntervalResolved.to"
                        class="ma-1"
                        color="error"
                      />
                    </span>

                    <span
                      v-else-if="
                        !rangeIntervalResolved.from && rangeIntervalResolved.to
                      "
                    >
                      Begins with first datapoint and ends before
                      <date-chip
                        :time-zone="rangeIntervalResolved.timeZone"
                        :utc-offset="rangeIntervalResolved.utcOffset"
                        :value="rangeIntervalResolved.to"
                        class="ma-1"
                        color="error"
                      />
                    </span>

                    <span
                      v-else-if="
                        rangeIntervalResolved.from && !rangeIntervalResolved.to
                      "
                    >
                      Begins at
                      <date-chip
                        :time-zone="rangeIntervalResolved.timeZone"
                        :utc-offset="rangeIntervalResolved.utcOffset"
                        :value="rangeIntervalResolved.from"
                        class="ma-1"
                        color="success"
                      />
                      and affects all datapoints thereafter</span
                    >
                  </span>
                </div>
              </template>
            </date-range-picker>
          </ValidationProvider>

          <time-zone-picker v-else v-model="rangeInterval.dateRange" />
        </template>
      </detail-dialog>

      <v-dialog
        v-model="stationDialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card tile>
          <v-toolbar color="primary" dark flat>
            <v-btn icon dark @click="stationDialog = false">
              <v-icon>{{ mdiClose }}</v-icon>
            </v-btn>
            <v-toolbar-title>Select stations</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark text @click="stationDialogCommit">OK</v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <station-search :org="org" show-hidden show-disabled>
            <template #select="{ item }">
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
          </station-search>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import _union from 'lodash/union'
import { mapGetters, mapMutations, mapState } from 'vuex'
import { ValidationProvider } from 'vee-validate'
import actions from '@/mixins/actions'
import interval from '@/mixins/interval'
import member from '@/mixins/member'
import AnnotationDetailActions from '@/components/AnnotationDetailActions'
import AnnotationDetailApplies from '@/components/AnnotationDetailApplies'
import AttribActionFields from '@/components/AttribActionFields'
import DatastreamSearch from '@/components/DatastreamSearch'
import DatastreamTotal from '@/components/DatastreamTotal'
import DateChip from '@/components/DateChip'
import DateRangePicker from '@/components/DateRangePicker'
import DetailDialog from '@/components/DetailDialog'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import DetailIntervals from '@/components/DetailIntervals'
import DetailMembers from '@/components/DetailMembers'
import EvaluateActionFields from '@/components/EvaluateActionFields'
import FlagActionFields from '@/components/FlagActionFields'
import MemberRoleFields from '@/components/MemberRoleFields'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'
import StationSearch from '@/components/StationSearch'
import StationTotal from '@/components/StationTotal'
import TimeZonePicker from '@/components/TimeZonePicker'

export default {
  components: {
    AnnotationDetailActions,
    AnnotationDetailApplies,
    AttribActionFields,
    DatastreamSearch,
    DatastreamTotal,
    DateChip,
    DateRangePicker,
    DetailDialog,
    DetailExternalRefs,
    DetailIntervals,
    DetailMembers,
    EvaluateActionFields,
    FlagActionFields,
    MemberRoleFields,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    StationSearch,
    StationTotal,
    TimeZonePicker,
    ValidationProvider
  },

  mixins: [actions, interval, member],

  props: {
    editing: { default: false, type: Boolean },
    org: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data() {
    const { org } = this
    return {
      datastreamDialog: false,
      stationDialog: false,

      member: {
        roles: [
          {
            text: 'contact'
          },
          {
            text: 'reporter'
          },
          {
            text: 'approver'
          }
        ]
      },

      stateItems: ['pending', 'approved', 'rejected'],

      timeZone:
        (org.general_config && org.general_config.default_time_zone) || 'UTC'
    }
  },

  computed: {
    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids',
      getQuantity: 'cart/getQuantity'
    }),

    ...mapState(['auth'])
  },

  watch: {
    'value.state': {
      handler(newValue, oldValue) {
        if (
          this.editing &&
          oldValue !== newValue &&
          (newValue === 'approved' || newValue === 'rejected')
        )
          this.setMemberRole(this.auth.user.person_id, 'approver')
      }
    }
  },

  methods: {
    ...mapMutations({
      incrementQuantity: 'cart/incrementQuantity',
      resetCart: 'cart/reset'
    }),

    addApplies(item) {
      if (!item.target) return

      this.resetCart()

      this[`${item.target}Dialog`] = true
    },

    removeApplies(item) {
      if (!item.target) return

      const key = `${item.target}_ids`
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
        'datastream_ids',
        _union(this.value.datastream_ids, this.cartIds)
      )

      this.datastreamDialog = false
    },

    stationDialogCommit() {
      this.$set(
        this.value,
        'station_ids',
        _union(this.value.station_ids, this.cartIds)
      )

      this.stationDialog = false
    }
  }
}
</script>

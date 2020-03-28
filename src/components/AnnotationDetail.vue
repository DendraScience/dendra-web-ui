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
                  name="title"
                  rules="required|min:5|max:100"
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
                  :readonly="!editing || $cannot('assign', value, '$set.state')"
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
              </v-flex>
            </v-layout>

            <standard-options :editing="editing" :value="value" />
            <standard-audit v-if="!editing" :value="value" />
            <standard-identifier :value="value" />
          </v-container>
        </v-card>
      </v-flex>

      <v-flex>
        <annotation-detail-applies
          :editing="editing"
          :value="value"
          @add="addApplies"
          @remove="removeApplies"
        />
      </v-flex>

      <v-flex>
        <detail-intervals
          :editing="editing"
          :value="value"
          @add="addInterval"
          @edit="editInterval"
          @remove="removeInterval"
        />
      </v-flex>

      <v-flex>
        <annotation-detail-actions
          :editing="editing"
          :value="value"
          @add="addAction"
          @remove="removeAction"
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
          <v-toolbar-title>Select datastreams</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="datastreamDialogCommit">OK</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <datastream-search
          :org="org"
          :show-hidden="$can('create', 'datastreams')"
          :show-options="$can('create', 'datastreams')"
          show-disabled
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
                item.quantitySelected ? 'check_box' : 'check_box_outline_blank'
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
      <template v-slot:title>Specify attribute</template>
      <template>
        <attrib-action-fields v-model="attribAction" />
      </template>
    </detail-dialog>

    <detail-dialog
      ref="evaluateActionDialog"
      v-model="evaluateAction"
      max-width="800"
      @commit="commitEvaluateAction"
    >
      <template v-slot:title>Specify expression</template>
      <template>
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
      <template v-slot:title>Specify flag</template>
      <template>
        <flag-action-fields v-model="flagAction" />
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
      ref="momentIntervalDialog"
      v-model="momentInterval"
      max-width="380"
      @commit="commitMomentInterval"
    >
      <template v-slot:title>Specify moment</template>
      <template>
        <ValidationProvider
          :rules="{
            resolved_valid: momentIntervalResolved
          }"
        >
          <date-range-picker
            v-model="momentInterval.dateRange"
            hide-to
            show-time
            show-time-zone
          >
            <template v-slot:footer>
              <div class="text-center">
                <span class="font-weight-medium">
                  <span v-if="!momentIntervalResolved.valid">
                    Please specify a single point in time
                  </span>

                  <span v-else-if="momentIntervalResolved.from">
                    Occurred at
                    <date-chip
                      :value="Object.freeze(momentIntervalResolved.from)"
                      class="ma-1"
                      color="success"
                    />
                  </span>
                </span>
              </div>
            </template>
          </date-range-picker>
        </ValidationProvider>
      </template>
    </detail-dialog>

    <detail-dialog
      ref="rangeIntervalDialog"
      v-model="rangeInterval"
      @commit="commitRangeInterval"
    >
      <template v-slot:title>Specify range</template>
      <template>
        <ValidationProvider
          :rules="{
            resolved_valid: rangeIntervalResolved
          }"
        >
          <date-range-picker
            v-model="rangeInterval.dateRange"
            nullable
            show-time
            show-time-zone
          >
            <template v-slot:footer>
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
                      :value="Object.freeze(rangeIntervalResolved.from)"
                      class="ma-1"
                      color="success"
                    />
                    and ends before
                    <date-chip
                      :value="Object.freeze(rangeIntervalResolved.to)"
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
                      :value="Object.freeze(rangeIntervalResolved.to)"
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
                      :value="Object.freeze(rangeIntervalResolved.from)"
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
      </template>
    </detail-dialog>

    <v-dialog
      v-model="stationDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="stationDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Select stations</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="stationDialogCommit">OK</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <station-search
          :org="org"
          :show-hidden="$can('create', 'stations')"
          show-disabled
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
                item.quantitySelected ? 'check_box' : 'check_box_outline_blank'
              }}</v-icon
            >
          </template>
        </station-search>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import _union from 'lodash/union'
import { mapGetters, mapMutations } from 'vuex'
import { ValidationProvider } from 'vee-validate'
import actions from '@/mixins/actions'
import interval from '@/mixins/interval'
import member from '@/mixins/member'
import AnnotationDetailActions from '@/components/AnnotationDetailActions'
import AnnotationDetailApplies from '@/components/AnnotationDetailApplies'
import AttribActionFields from '@/components/AttribActionFields'
import DatastreamSearch from '@/components/DatastreamSearch'
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

export default {
  components: {
    AnnotationDetailActions,
    AnnotationDetailApplies,
    AttribActionFields,
    DatastreamSearch,
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
    ValidationProvider
  },

  mixins: [actions, interval, member],

  props: {
    editing: { default: false, type: Boolean },
    org: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    datastreamDialog: false,
    stationDialog: false,

    stateItems: ['pending', 'approved', 'rejected']
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

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

    <v-dialog v-model="flagDialog" max-width="380">
      <v-card>
        <ValidationObserver ref="flagObserver" v-slot="{ invalid }">
          <v-card-title class="headline grey lighten-4 mb-4"
            >Specify flag</v-card-title
          >

          <v-container fluid>
            <v-layout column>
              <v-flex>
                <ValidationProvider
                  v-slot="{ errors }"
                  :rules="{ alpha_num: true, max: 20, required: true }"
                  name="flag"
                >
                  <v-text-field
                    v-if="flagDialog"
                    v-model.trim="flag"
                    :error-messages="errors"
                    autofocus
                    label="Flag"
                    prepend-inner-icon="flag"
                    solo
                  ></v-text-field>
                </ValidationProvider>
              </v-flex>
            </v-layout>
          </v-container>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn
              :disabled="invalid"
              color="primary"
              text
              @click="flagDialogCommit"
              >OK</v-btn
            >
            <v-btn color="primary" text @click="flagDialog = false"
              >Cancel</v-btn
            >
          </v-card-actions>
        </ValidationObserver>
      </v-card>
    </v-dialog>

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

    <detail-dialog
      ref="momentIntervalDialog"
      v-model="momentInterval"
      max-width="380"
      @commit="commitMomentInterval"
    >
      <template v-slot:title
        >Specify moment</template
      >
      <template>
        <ValidationProvider
          :rules="{
            date_range_resolved: momentIntervalResolved
          }"
        >
          <date-range-picker
            v-model="momentInterval.dateRange"
            hide-to
            show-time
          >
            <template v-slot:footer>
              <span class="font-weight-bold">
                <span v-if="!momentIntervalResolved.valid">
                  Please specify a single point in time
                </span>
                <span v-else-if="momentIntervalResolved.from">
                  Occurred at
                  {{
                    momentIntervalResolved.from | moment('', ['format', 'lll'])
                  }}</span
                >
              </span>
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
      <template v-slot:title
        >Specify range</template
      >
      <template>
        <ValidationProvider
          :rules="{
            date_range_resolved: rangeIntervalResolved
          }"
        >
          <date-range-picker
            v-model="rangeInterval.dateRange"
            nullable
            show-time
          >
            <template v-slot:footer>
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
                  {{
                    rangeIntervalResolved.from | moment('', ['format', 'lll'])
                  }}
                  and ends before
                  {{
                    rangeIntervalResolved.to | moment('', ['format', 'lll'])
                  }}</span
                >
                <span
                  v-else-if="
                    !rangeIntervalResolved.from && rangeIntervalResolved.to
                  "
                >
                  Begins with first datapoint and ends before
                  {{
                    rangeIntervalResolved.to | moment('', ['format', 'lll'])
                  }}</span
                >
                <span
                  v-else-if="
                    rangeIntervalResolved.from && !rangeIntervalResolved.to
                  "
                >
                  Begins at
                  {{
                    rangeIntervalResolved.from | moment('', ['format', 'lll'])
                  }}
                  and affects all datapoints thereafter</span
                >
              </span>
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

        <station-search :org="org" show-disabled>
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
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import interval from '@/mixins/interval'
import member from '@/mixins/member'
import AnnotationDetailActions from '@/components/AnnotationDetailActions'
import AnnotationDetailApplies from '@/components/AnnotationDetailApplies'
import DatastreamSearch from '@/components/DatastreamSearch'
import DateRangePicker from '@/components/DateRangePicker'
import DetailDialog from '@/components/DetailDialog'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import DetailIntervals from '@/components/DetailIntervals'
import DetailMembers from '@/components/DetailMembers'
import MemberRoleFields from '@/components/MemberRoleFields'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'
import StationSearch from '@/components/StationSearch'

export default {
  components: {
    AnnotationDetailActions,
    AnnotationDetailApplies,
    DatastreamSearch,
    DateRangePicker,
    DetailDialog,
    DetailExternalRefs,
    DetailIntervals,
    DetailMembers,
    MemberRoleFields,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    StationSearch,
    ValidationObserver,
    ValidationProvider
  },

  mixins: [interval, member],

  props: {
    editing: { default: false, type: Boolean },
    org: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    datastreamDialog: false,
    flagDialog: false,
    stationDialog: false,

    flag: null,

    member: {
      roles: [
        {
          text: 'contact'
        },
        {
          text: 'reporter'
        }
      ]
    },

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

    addAction(item) {
      if (item.target === 'exclude') {
        const { value } = this
        const action = value.actions.find(
          action => action.exclude !== undefined
        )

        if (!action) value.actions.push({ exclude: true })
      } else if (item.target === 'flag') {
        this.flagDialog = true
        this.flag = null

        requestAnimationFrame(() => {
          this.$refs.flagObserver.reset()
        })
      }
    },

    addApplies(item) {
      if (!item.target) return

      this.resetCart()

      this[`${item.target}Dialog`] = true
    },

    removeAction(item) {
      this.value.actions = this.value.actions.filter(
        (action, index) => index !== item.key
      )
    },

    removeApplies(item) {
      if (!item.target) return

      const key = `${item.target}_ids`
      const ids = this.value[key]

      this.$set(this.value, key, ids.filter(id => id !== item.id))
    },

    datastreamDialogCommit() {
      this.$set(
        this.value,
        'datastream_ids',
        _union(this.value.datastream_ids, this.cartIds)
      )

      this.datastreamDialog = false
    },

    flagDialogCommit() {
      const { value } = this
      const action = value.actions.find(action => action.flag !== undefined)
      const flag = [this.flag]

      if (action) {
        action.flag = _union(action.flag, flag)
      } else {
        value.actions.push({ flag })
      }

      this.flagDialog = false
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

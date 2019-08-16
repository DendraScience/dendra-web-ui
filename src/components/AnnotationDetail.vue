<template>
  <v-container fluid pa-0>
    <v-layout column>
      <v-flex>
        <v-card>
          <v-container fluid>
            <v-layout column>
              <v-flex pb-0>
                <v-text-field
                  v-model.trim="value.title"
                  v-validate="'required|min:5|max:100'"
                  :error-messages="errors.collect('title')"
                  :readonly="!editing"
                  data-vv-name="title"
                  label="Title"
                  required
                ></v-text-field>

                <v-select
                  v-if="typeof value.state === 'string'"
                  v-model="value.state"
                  :items="stateItems"
                  :readonly="!editing || $cannot('assign', value, '$set.state')"
                  label="State"
                ></v-select>

                <v-textarea
                  v-model.trim="value.description"
                  v-validate="'required|min:5|max:5000'"
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

      <v-flex>
        <annotation-detail-applies
          :editing="editing"
          :value="value"
          @add="addApplies"
          @remove="removeApplies"
        />
      </v-flex>

      <v-flex>
        <annotation-detail-intervals
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
        <annotation-detail-members
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
      <validation-provider
        ref="flagProvider"
        v-slot="{ errors, valid }"
        :rules="{ alpha_num: true, max: 2, required: true }"
        name="flag"
        slim
      >
        <v-card>
          <v-card-title class="headline grey lighten-4 mb-4"
            >Specify flag</v-card-title
          >

          <v-card-text>
            <v-container fluid>
              <v-layout column>
                <v-flex>
                  <v-text-field
                    v-if="flagDialog"
                    v-model.trim="flag"
                    :error-messages="errors"
                    autofocus
                    data-vv-name="flag"
                    label="Flag"
                    prepend-inner-icon="flag"
                    solo
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn
              :disabled="!valid"
              color="primary"
              text
              @click="flagDialogCommit"
              >OK</v-btn
            >
            <v-btn color="primary" text @click="flagDialog = false"
              >Cancel</v-btn
            >
          </v-card-actions>
        </v-card>
      </validation-provider>
    </v-dialog>

    <v-dialog v-model="memberDialog" max-width="380">
      <v-card>
        <v-card-title class="headline grey lighten-4 mb-4"
          >Specify member</v-card-title
        >

        <v-card-text>
          <v-container fluid>
            <v-layout column>
              <v-flex>
                <member-select
                  v-model="member"
                  :disabled="memberDisabled"
                  :org="org"
                />
              </v-flex>

              <v-flex mx-2>
                <v-checkbox
                  v-for="role in memberRoles"
                  :key="role.text"
                  v-model="role.value"
                  :label="role.text"
                  class="my-0"
                ></v-checkbox>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="!member.personId"
            color="primary"
            text
            @click="memberDialogCommit"
            >OK</v-btn
          >
          <v-btn color="primary" text @click="memberDialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="momentDialog" max-width="380">
      <v-card>
        <v-card-title class="headline grey lighten-4 mb-4"
          >Specify moment</v-card-title
        >

        <date-range-picker v-model="dateRange" hide-to show-time>
          <template v-slot:footer>
            <span class="font-weight-bold">
              <span v-if="!momentDialogValid">
                Please specify a single point in time.
              </span>
              <span v-else-if="dateRangeResolved.from">
                Occurred at
                {{
                  dateRangeResolved.from | moment('', ['format', 'lll'])
                }}</span
              >
            </span>
          </template>
        </date-range-picker>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="!momentDialogValid"
            color="primary"
            text
            @click="momentDialogCommit"
            >OK</v-btn
          >
          <v-btn color="primary" text @click="momentDialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="rangeDialog" max-width="680">
      <v-card>
        <v-card-title class="headline grey lighten-4"
          >Specify range</v-card-title
        >

        <date-range-picker v-model="dateRange" nullable show-time>
          <template v-slot:footer>
            <span class="font-weight-medium">
              <span v-if="!rangeDialogValid">
                Please specify a begin and end time.
              </span>
              <span v-else-if="dateRangeResolved.from && dateRangeResolved.to">
                Begins at
                {{ dateRangeResolved.from | moment('', ['format', 'lll']) }} and
                ends before
                {{ dateRangeResolved.to | moment('', ['format', 'lll']) }}</span
              >
              <span v-else-if="!dateRangeResolved.from && dateRangeResolved.to">
                Begins with first datapoint and ends before
                {{ dateRangeResolved.to | moment('', ['format', 'lll']) }}</span
              >
              <span v-else-if="dateRangeResolved.from && !dateRangeResolved.to">
                Begins at
                {{ dateRangeResolved.from | moment('', ['format', 'lll']) }} and
                affects all datapoints thereafter</span
              >
            </span>
          </template>
        </date-range-picker>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="!rangeDialogValid"
            color="primary"
            text
            @click="rangeDialogCommit"
            >OK</v-btn
          >
          <v-btn color="primary" text @click="rangeDialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ValidationProvider } from 'vee-validate'
import moment from 'moment'
import _union from 'lodash/union'
import { mapGetters, mapMutations } from 'vuex'
import AnnotationDetailActions from '@/components/AnnotationDetailActions'
import AnnotationDetailApplies from '@/components/AnnotationDetailApplies'
import AnnotationDetailIntervals from '@/components/AnnotationDetailIntervals'
import AnnotationDetailMembers from '@/components/AnnotationDetailMembers'
import DatastreamSearch from '@/components/DatastreamSearch'
import DateRangePicker from '@/components/DateRangePicker'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import MemberSelect from '@/components/MemberSelect'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'
import StationSearch from '@/components/StationSearch'

export default {
  components: {
    AnnotationDetailActions,
    AnnotationDetailApplies,
    AnnotationDetailIntervals,
    AnnotationDetailMembers,
    DatastreamSearch,
    DateRangePicker,
    DetailExternalRefs,
    MemberSelect,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    StationSearch,
    ValidationProvider
  },

  inject: ['$validator'],

  props: {
    editing: { default: false, type: Boolean },
    org: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    datastreamDialog: false,
    flagDialog: false,
    memberDialog: false,
    momentDialog: false,
    rangeDialog: false,
    stationDialog: false,

    flag: null,

    intervalKey: -1,

    dateRange: {
      from: null,
      fromEnabled: true,
      fromTime: null,
      to: null,
      toEnabled: true,
      toTime: null
    },

    member: {
      personId: null
    },
    memberDisabled: false,
    memberRoles: [
      {
        text: 'contact',
        value: null
      },
      {
        text: 'reporter',
        value: null
      }
    ],

    stateItems: ['pending', 'approved', 'rejected']
  }),

  computed: {
    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids'
    }),

    dateRangeResolved() {
      const { dateRange } = this

      const resolved = { from: null, to: null }

      if (dateRange.fromEnabled) {
        const date = moment(dateRange.from, this.$dateFormats.y4md, true)
        const time = moment(dateRange.fromTime, this.$dateFormats.hm12, true)

        if (date.isValid() && time.isValid()) {
          resolved.from = moment(
            `${date.format('YYYYMMDD')} ${time.format('HHmm')}`,
            'YYYYMMDD HHmm',
            true
          ).toISOString()
        } else {
          resolved.invalid = true
        }
      }

      if (dateRange.toEnabled) {
        const date = moment(dateRange.to, this.$dateFormats.y4md, true)
        const time = moment(dateRange.toTime, this.$dateFormats.hm12, true)

        if (date.isValid() && time.isValid()) {
          resolved.to = moment(
            `${date.format('YYYYMMDD')} ${time.format('HHmm')}`,
            'YYYYMMDD HHmm',
            true
          ).toISOString()
        } else {
          resolved.invalid = true
        }
      }

      return resolved
    },

    momentDialogValid() {
      const { dateRangeResolved } = this

      if (dateRangeResolved.invalid) return false
      return true
    },

    rangeDialogValid() {
      const { dateRangeResolved } = this

      if (dateRangeResolved.invalid) return false
      if (dateRangeResolved.from && dateRangeResolved.to) {
        return moment(dateRangeResolved.from).isBefore(
          moment(dateRangeResolved.to)
        )
      }
      return true
    }
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
        const provider = this.$refs.flagProvider
        if (provider) provider.reset()

        this.flag = null
        this.flagDialog = true
      }
    },

    addApplies(item) {
      if (!item.target) return

      this.resetCart()

      this[`${item.target}Dialog`] = true
    },

    addInterval(item) {
      if (!item.target) return

      const date = moment()
      const time = moment('0000', 'HHmm', true)

      this.intervalKey = -1
      this.dateRange = {
        from: date.format(this.$dateFormats.y4md),
        fromEnabled: true,
        fromTime: time.format(this.$dateFormats.hm12),
        to: date.add(1, 'd').format(this.$dateFormats.y4md),
        toEnabled: true,
        toTime: time.format(this.$dateFormats.hm12)
      }

      this[`${item.target}Dialog`] = true
    },

    addMember() {
      this.member.personId = null
      this.memberRoles.forEach(role => (role.value = null))
      this.memberDisabled = false
      this.memberDialog = true
    },

    editInterval(item) {
      if (!item.target) return

      this.intervalKey = item.key
      this.dateRange = {
        from: item.beginsAt
          ? item.beginsAt.format(this.$dateFormats.y4md)
          : null,
        fromEnabled: !!item.beginsAt,
        fromTime: item.beginsAt
          ? item.beginsAt.format(this.$dateFormats.hm12)
          : null,
        to: item.endsBefore
          ? item.endsBefore.format(this.$dateFormats.y4md)
          : null,
        toEnabled: !!item.endsBefore,
        toTime: item.endsBefore
          ? item.endsBefore.format(this.$dateFormats.hm12)
          : null
      }

      this[`${item.target}Dialog`] = true
    },

    editMember(item) {
      const roles = this.value.involved_parties
        .filter(party => party.person_id === item.id)
        .reduce((accum, party) => accum.concat(party.roles), [])

      this.member.personId = item.id
      this.memberRoles.forEach(role => (role.value = roles.includes(role.text)))
      this.memberDisabled = true
      this.memberDialog = true
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

    removeInterval(item) {
      this.value.intervals = this.value.intervals.filter(
        (interval, index) => index !== item.key
      )
    },

    removeMember(item) {
      this.value.involved_parties = this.value.involved_parties.filter(
        (action, index) => index !== item.key
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

    flagDialogCommit() {
      const { value } = this
      const action = value.actions.find(action => action.flag !== undefined)
      const flag = [this.flag.toUpperCase()]

      if (action) {
        action.flag = _union(action.flag, flag)
      } else {
        value.actions.push({ flag })
      }

      this.flagDialog = false
    },

    memberDialogCommit() {
      const { member, memberRoles, value } = this

      const involvedParties = value.involved_parties.filter(
        party => party.person_id !== member.personId
      )
      const roles = memberRoles
        .filter(role => role.value)
        .map(role => role.text)
      if (roles.length)
        involvedParties.push({
          person_id: member.personId,
          roles
        })

      value.involved_parties = involvedParties

      this.memberDialog = false
    },

    momentDialogCommit() {
      const { dateRangeResolved, intervalKey, value } = this
      const newInterval = {}

      if (dateRangeResolved.from) {
        newInterval.begins_at = dateRangeResolved.from
        newInterval.ends_before = moment(dateRangeResolved.from).add(1, 'ms')
      }

      if (intervalKey > -1) {
        value.intervals = value.intervals.map((interval, index) =>
          index === intervalKey ? newInterval : interval
        )
      } else {
        value.intervals.push(newInterval)
      }

      this.momentDialog = false
    },

    rangeDialogCommit() {
      const { dateRangeResolved, intervalKey, value } = this
      const newInterval = {}

      if (dateRangeResolved.from) newInterval.begins_at = dateRangeResolved.from
      if (dateRangeResolved.to) newInterval.ends_before = dateRangeResolved.to

      if (intervalKey > -1) {
        value.intervals = value.intervals.map((interval, index) =>
          index === intervalKey ? newInterval : interval
        )
      } else {
        value.intervals.push(newInterval)
      }

      this.rangeDialog = false
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

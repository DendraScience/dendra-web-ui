<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline" cols="12" sm="8">
          <slot>Timeframes</slot>
        </v-col>

        <v-col align="end" cols="12" sm="4">
          <v-select
            v-model="timeZone"
            :items="timeZoneItems"
            dense
            hide-details
            label="Time zone"
            outlined
          ></v-select>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col>
          <v-data-table
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="items"
            disable-pagination
            disable-sort
            hide-default-footer
            item-key="key"
          >
            <template v-slot:item.type="{ item }" class="text-no-wrap px-0">
              <v-icon>{{ item.icon }}</v-icon>
            </template>

            <template v-slot:item.begins="{ item }" class="py-4">
              <span v-if="item.beginsLabel" class="mr-1">{{
                item.beginsLabel
              }}</span>
              <date-chip
                :time-zone="item.timeZone"
                :utc-offset="item.utcOffset"
                :value="item.beginsAt"
                class="ma-1"
                color="success"
                small
              />
            </template>

            <template v-slot:item.ends="{ item }" class="py-4">
              <span v-if="item.endsLabel" class="mr-1">{{
                item.endsLabel
              }}</span>
              <date-chip
                :time-zone="item.timeZone"
                :utc-offset="item.utcOffset"
                :value="item.endsBefore"
                class="ma-1"
                color="error"
                small
              />
            </template>

            <template v-slot:item.icons="{ item }">
              <span v-if="editing" class="text-no-wrap">
                <v-icon color="tertiary" class="mr-2" @click="edit(item)"
                  >edit</v-icon
                >
                <v-icon color="tertiary" @click="remove(item)"
                  >mdi-minus-circle</v-icon
                >
              </span>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <v-card-actions v-if="editing">
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" v-on="on">
            <v-icon>add</v-icon>
          </v-btn>
        </template>

        <v-list two-line subheader>
          <v-list-item
            v-for="(item, index) in addItems"
            :key="index"
            @click="add(item)"
          >
            <v-list-item-avatar>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.subtitle }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment'
import DateChip from '@/components/DateChip'
import itemEditing from '@/mixins/item-editing'
import { timeZoneItems, timeZoneOffsets } from '@/lib/time-zone'

export default {
  components: {
    DateChip
  },

  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    initialTimeZone: { default: 'UTC', type: String },
    value: { type: Object, required: true }
  },

  data() {
    return {
      headers: [
        {
          align: 'center',
          value: 'type',
          width: '50px'
        },
        {
          align: 'left',
          text: 'Timeframe',
          value: 'begins',
          width: '30%'
        },
        {
          align: 'left',
          value: 'ends',
          width: '30%'
        },
        {
          align: 'right',
          value: 'icons'
        }
      ],

      timeZone: this.initialTimeZone,
      timeZoneItems
    }
  },

  computed: {
    addItems() {
      const { timeZone } = this
      const timeZoneOffset = timeZoneOffsets[timeZone]
      const utcOffset = timeZoneOffset || 0

      return [
        {
          icon: 'mdi-calendar-range',
          subtitle: 'Specify a begin and end time.',
          target: 'range',
          title: 'Range',
          timeZone,
          utcOffset
        },
        {
          icon: 'mdi-watch',
          subtitle: 'Specify a single point in time.',
          target: 'moment',
          title: 'Moment',
          timeZone,
          utcOffset
        }
      ]
    },

    intervals() {
      return this.value.intervals
    },

    items() {
      const { timeZone } = this
      const timeZoneOffset = timeZoneOffsets[timeZone]
      const utcOffset = timeZoneOffset || 0

      return this.intervals.map((item, key) => {
        const beginsAt =
          item.begins_at && moment.utc(item.begins_at).add(utcOffset, 's')
        const endsBefore =
          item.ends_before && moment.utc(item.ends_before).add(utcOffset, 's')

        if (beginsAt && endsBefore) {
          if (endsBefore.diff(beginsAt) === 1) {
            return {
              beginsAt,
              beginsLabel: 'Occurred at',
              icon: 'mdi-watch',
              key,
              target: 'moment',
              timeZone,
              utcOffset
            }
          }

          return {
            beginsAt,
            beginsLabel: 'Begins at',
            endsBefore,
            endsLabel: 'and ends before',
            icon: 'mdi-calendar-range',
            key,
            target: 'range',
            timeZone,
            utcOffset
          }
        }

        if (!beginsAt && endsBefore) {
          return {
            beginsLabel: 'Begins with first datapoint and ends before',
            endsBefore,
            icon: 'mdi-calendar-range',
            key,
            target: 'range',
            timeZone,
            utcOffset
          }
        }

        if (beginsAt && !endsBefore) {
          return {
            beginsAt,
            beginsLabel: 'Begins at',
            endsLabel: 'and affects all datapoints thereafter',
            icon: 'mdi-calendar-range',
            key,
            target: 'range',
            timeZone,
            utcOffset
          }
        }

        return {
          beginsLabel: 'Invalid interval!',
          icon: 'mdi-alert',
          key
        }
      })
    }
  }
}
</script>

<template>
  <v-card>
    <v-card-title primary-title class="headline">
      <slot>Timeframe</slot>
    </v-card-title>

    <v-container fluid pt-0 px-3>
      <v-layout row wrap>
        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="items"
            disable-initial-sort
            hide-actions
            item-key="key"
          >
            <template v-slot:items="{ item }">
              <td class="text-xs-center text-no-wrap px-0">
                <v-icon>{{ item.icon }}</v-icon>
              </td>

              <td class="py-3">
                <span v-if="item.beginsLabel">{{ item.beginsLabel }}</span>
                <date-chip
                  :value="Object.freeze(item.beginsAt)"
                  color="success"
                />
                <span v-if="item.endsLabel">{{ item.endsLabel }}</span>
                <date-chip
                  :value="Object.freeze(item.endsBefore)"
                  color="error"
                />
              </td>

              <td class="text-xs-right text-no-wrap">
                <span v-if="editing">
                  <v-icon color="tertiary" class="mr-2" @click="edit(item)"
                    >edit</v-icon
                  >
                  <v-icon color="tertiary" @click="remove(item)"
                    >remove_circle</v-icon
                  >
                </span>
              </td>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>

    <v-card-actions v-if="editing">
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" v-on="on">
            <v-icon>add</v-icon>
          </v-btn>
        </template>

        <v-list two-line subheader>
          <v-list-tile
            v-for="(item, index) in addItems"
            :key="index"
            @click="add(item)"
          >
            <v-list-tile-avatar>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<script>
import DateChip from '@/components/DateChip'

import moment from 'moment'

export default {
  components: {
    DateChip
  },

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    addItems: [
      {
        icon: 'date_range',
        title: 'Range',
        subtitle: 'Specify a begin and end time.'
      },
      {
        icon: 'watch',
        title: 'Moment',
        subtitle: 'Specify a single point in time.'
      }
    ],

    headers: [
      {
        align: 'center',
        sortable: false,
        value: 'key',
        width: '10%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Description',
        width: '60%'
      },
      {
        sortable: false,
        value: 'key'
      }
    ]
  }),

  computed: {
    items() {
      return this.value.items.map(item => {
        const beginsAt = item.begins_at && moment(item.begins_at)
        const endsBefore = item.ends_before && moment(item.ends_before)

        if (beginsAt && endsBefore) {
          if (endsBefore.diff(beginsAt) === 1) {
            return {
              beginsLabel: 'Occurred at',
              beginsAt,
              icon: 'watch'
            }
          }

          return {
            beginsLabel: 'Begins at',
            beginsAt,
            endsLabel: 'and ends before',
            endsBefore,
            icon: 'date_range'
          }
        }

        if (!beginsAt && endsBefore) {
          return {
            beginsLabel: 'Begins with first datapoint and ends before',
            endsBefore,
            icon: 'date_range'
          }
        }

        if (beginsAt && !endsBefore) {
          return {
            beginsLabel: 'Begins at',
            beginsAt,
            endsLabel: 'and affects all datapoints thereafter',
            icon: 'date_range'
          }
        }

        return {
          beginsLabel: 'Invalid interval!',
          icon: 'error'
        }
      })
    }
  },

  methods: {
    add(item) {},

    edit(item) {},

    remove(item) {}
  }
}
</script>

<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline" cols="12" sm="8">
          <slot>Datapoints configuration</slot>
        </v-col>

        <v-col align="end" cols="12" sm="4">
          <v-select
            :items="timeZoneItems"
            :value="timeZone"
            dense
            hide-details
            item-text="text"
            item-value="abbr"
            label="Time zone"
            outlined
            @change="$emit('update:timeZone', $event)"
          ></v-select>
        </v-col>
      </v-row>

      <v-row dense>
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
            <template v-slot:item.params="{ item }">
              <pre-block :value="item.params" />
            </template>

            <template v-slot:item.begins="{ item }" class="py-4">
              <span v-if="item.beginsLabel" class="mr-1">{{
                item.beginsLabel
              }}</span>
              <date-chip
                :time-zone="item.timeZone"
                :utc-offset="item.utcOffset"
                :value="Object.freeze(item.beginsAt)"
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
                :value="Object.freeze(item.endsBefore)"
                class="ma-1"
                color="error"
                small
              />
            </template>

            <template v-slot:item.icons="{ item }" class="text-no-wrap">
              <span v-if="editing && !item.connection" class="text-no-wrap">
                <v-icon color="tertiary" class="mr-2" @click="edit(item)">{{
                  mdiPencil
                }}</v-icon>
                <v-icon color="tertiary" @click="remove(item)">{{
                  mdiMinusCircle
                }}</v-icon>
              </span>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <v-card-actions v-if="editing">
      <v-btn color="primary" @click="add(addItem)">
        <v-icon>{{ mdiPlus }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment'
import DateChip from '@/components/DateChip'
import PreBlock from '@/components/PreBlock'
import itemEditing from '@/mixins/item-editing'
import { timeZoneItems, timeZoneOffsets } from '@/lib/time-zone'
import { jsonFormat } from '@/lib/utils'

export default {
  components: {
    DateChip,
    PreBlock
  },

  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    timeZone: { default: 'UTC', type: String },
    value: { type: Object, required: true }
  },

  data: () => ({
    headers: [
      {
        align: 'left',
        text: 'Parameters',
        value: 'params',
        width: '20%'
      },
      {
        align: 'left',
        text: 'Timeframe',
        value: 'begins',
        width: '20%'
      },
      {
        align: 'left',
        value: 'ends',
        width: '20%'
      },
      {
        align: 'right',
        value: 'icons'
      }
    ],

    timeZoneItems
  }),

  computed: {
    addItem() {
      const { timeZone } = this
      const timeZoneOffset = timeZoneOffsets[timeZone]
      const utcOffset = timeZoneOffset || 0

      return {
        timeZone,
        utcOffset
      }
    },

    datapointsConfig() {
      return this.value.datapoints_config || []
    },

    items() {
      const { datapointsConfig, timeZone } = this
      const timeZoneOffset = timeZoneOffsets[timeZone]
      const utcOffset = timeZoneOffset || 0

      return datapointsConfig.map((item, key) => {
        const beginsAt =
          item.begins_at && moment.utc(item.begins_at).add(utcOffset, 's')
        const endsBefore =
          item.ends_before && moment.utc(item.ends_before).add(utcOffset, 's')
        const params = jsonFormat(item.params)
        const { actions, connection, path } = item

        if (beginsAt && endsBefore) {
          return {
            actions,
            beginsAt,
            beginsLabel: 'Begins at',
            connection,
            endsBefore,
            endsLabel: 'and ends before',
            key,
            params,
            path,
            timeZone,
            utcOffset
          }
        }

        if (!beginsAt && endsBefore) {
          return {
            actions,
            beginsLabel: 'Begins with first row and ends before',
            connection,
            endsBefore,
            key,
            params,
            path,
            timeZone,
            utcOffset
          }
        }

        if (beginsAt && !endsBefore) {
          return {
            actions,
            beginsAt,
            beginsLabel: 'Begins at',
            connection,
            endsLabel: 'and returns all rows thereafter',
            key,
            params,
            path,
            timeZone,
            utcOffset
          }
        }

        return {
          actions,
          beginsLabel: 'Begins with first row',
          connection,
          endsLabel: 'and returns all rows thereafter',
          key,
          params,
          path,
          timeZone,
          utcOffset
        }
      })
    }
  }
}
</script>

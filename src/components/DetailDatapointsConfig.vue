<template>
  <v-card>
    <v-card-title class="headline">
      <slot>Datapoints configuration</slot>
    </v-card-title>

    <v-container fluid pt-0>
      <v-layout>
        <v-flex>
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
                :value="Object.freeze(item.beginsAt)"
                class="mr-1 my-1"
                color="success"
                format="lll (UTC)"
              />
            </template>

            <template v-slot:item.ends="{ item }" class="py-4">
              <span v-if="item.endsLabel" class="mr-1">{{
                item.endsLabel
              }}</span>
              <date-chip
                :value="Object.freeze(item.endsBefore)"
                class="mr-1 my-1"
                color="error"
                format="lll (UTC)"
              />
            </template>

            <template v-slot:item.icons="{ item }" class="text-no-wrap">
              <span v-if="editing && !item.connection" class="text-no-wrap">
                <v-icon color="tertiary" class="mr-2" @click="edit(item)"
                  >edit</v-icon
                >
                <v-icon color="tertiary" @click="remove(item)"
                  >mdi-minus-circle</v-icon
                >
              </span>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>

    <v-card-actions v-if="editing">
      <v-btn color="primary" @click="add">
        <v-icon>add</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment'
import DateChip from '@/components/DateChip'
import PreBlock from '@/components/PreBlock'
import itemEditing from '@/mixins/item-editing'
import { jsonFormat } from '@/lib/utils'

export default {
  components: {
    DateChip,
    PreBlock
  },

  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  data: () => ({
    addItems: [
      {
        icon: 'mdi-dice-1',
        subtitle: 'Specify a typed value without unit.',
        target: 'value',
        title: 'Single value'
      },
      {
        icon: 'mdi-dice-multiple',
        subtitle: 'Specify a delta, range or value with unit.',
        target: 'object',
        title: 'Structured value'
      }
    ],

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
    ]
  }),

  computed: {
    datapointsConfig() {
      return this.value.datapoints_config || []
    },

    items() {
      const { datapointsConfig } = this

      return datapointsConfig.map((item, key) => {
        const beginsAt = item.begins_at && moment.utc(item.begins_at)
        const endsBefore = item.ends_before && moment.utc(item.ends_before)
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
            icon: 'mdi-calendar-range',
            key,
            params,
            path
          }
        }

        if (!beginsAt && endsBefore) {
          return {
            actions,
            beginsLabel: 'Begins with first row and ends before',
            connection,
            endsBefore,
            icon: 'mdi-calendar-range',
            key,
            params,
            path
          }
        }

        if (beginsAt && !endsBefore) {
          return {
            actions,
            beginsAt,
            beginsLabel: 'Begins at',
            connection,
            endsLabel: 'and returns all rows thereafter',
            icon: 'mdi-calendar-range',
            key,
            params,
            path
          }
        }

        return {
          actions,
          beginsLabel: 'Begins with first row',
          connection,
          endsLabel: 'and returns all rows thereafter',
          icon: 'mdi-calendar-range',
          key,
          params,
          path
        }
      })
    }
  }
}
</script>

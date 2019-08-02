<template>
  <v-card>
    <v-card-title class="headline">
      <slot>Timeframe</slot>
    </v-card-title>

    <v-container fluid pt-0>
      <v-layout wrap>
        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="items"
            :mobile-breakpoint="0"
            hide-default-footer
            item-key="key"
          >
            <template v-slot:item.type="{ item }" class="text-no-wrap px-0">
              <v-icon>{{ item.icon }}</v-icon>
            </template>

            <template v-slot:item.description="{ item }" class="py-4">
              <span v-if="item.beginsLabel">{{ item.beginsLabel }}</span>
              <date-chip
                :value="Object.freeze(item.beginsAt)"
                class="ml-1"
                color="success"
              />
              <span v-if="item.endsLabel" class="ml-1">{{
                item.endsLabel
              }}</span>
              <date-chip
                :value="Object.freeze(item.endsBefore)"
                class="ml-1"
                color="error"
              />
            </template>

            <template v-slot:item.icons="{ item }" class="text-no-wrap">
              <span v-if="editing">
                <v-icon color="tertiary" class="mr-2" @click="edit(item)"
                  >edit</v-icon
                >
                <v-icon color="tertiary" @click="remove(item)"
                  >remove_circle</v-icon
                >
              </span>
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
        target: 'range',
        title: 'Range',
        subtitle: 'Specify a begin and end time.'
      },
      {
        icon: 'watch',
        target: 'moment',
        title: 'Moment',
        subtitle: 'Specify a single point in time.'
      }
    ],

    headers: [
      {
        align: 'center',
        sortable: false,
        value: 'type',
        width: '10%'
      },
      {
        align: 'left',
        sortable: false,
        text: 'Description',
        value: 'description',
        width: '60%'
      },
      {
        align: 'right',
        sortable: false,
        value: 'icons'
      }
    ]
  }),

  computed: {
    intervals() {
      return this.value.intervals
    },

    items() {
      return this.intervals.map((item, key) => {
        const beginsAt = item.begins_at && moment(item.begins_at)
        const endsBefore = item.ends_before && moment(item.ends_before)

        if (beginsAt && endsBefore) {
          if (endsBefore.diff(beginsAt) === 1) {
            return {
              beginsLabel: 'Occurred at',
              beginsAt,
              icon: 'watch',
              target: 'moment',
              key
            }
          }

          return {
            beginsLabel: 'Begins at',
            beginsAt,
            endsLabel: 'and ends before',
            endsBefore,
            icon: 'date_range',
            target: 'range',
            key
          }
        }

        if (!beginsAt && endsBefore) {
          return {
            beginsLabel: 'Begins with first datapoint and ends before',
            endsBefore,
            icon: 'date_range',
            target: 'range',
            key
          }
        }

        if (beginsAt && !endsBefore) {
          return {
            beginsLabel: 'Begins at',
            beginsAt,
            endsLabel: 'and affects all datapoints thereafter',
            icon: 'date_range',
            target: 'range',
            key
          }
        }

        return {
          beginsLabel: 'Invalid interval!',
          icon: 'error',
          key
        }
      })
    }
  },

  methods: {
    add(item) {
      this.$emit('add', item)
    },

    edit(item) {
      this.$emit('edit', item)
    },

    remove(item) {
      this.$emit('remove', item)
    }
  }
}
</script>

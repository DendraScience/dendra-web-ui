<template>
  <v-card>
    <v-card-title primary-title class="headline">
      <slot>Time frame</slot>
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

              <td>{{ item.interval }}</td>

              <td class="text-xs-right text-no-wrap px-0">
                <v-icon v-if="editing" color="tertiary">remove_circle</v-icon>
              </td>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>

    <v-card-actions v-if="editing">
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn color="tertiary" dark v-on="on">
            <v-icon dark>add</v-icon>
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
export default {
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
        value: 'interval',
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
      return [
        {
          key: `1`,
          icon: 'watch',
          interval: 'Occurred at 2019-07-06 1:04 PM'
        },
        {
          key: `2`,
          icon: 'date_range',
          interval:
            'Begins with first data point, then ends before 2019-07-06 1:04 PM'
        },
        {
          key: `3`,
          icon: 'date_range',
          interval:
            'Begins at 2019-07-06 1:04 PM and effects all data points thereafter'
        },
        {
          key: `4`,
          icon: 'date_range',
          interval:
            'Begins at 2019-07-06 1:04 PM, then ends before 2019-07-06 1:04 PM'
        }
      ]
    }
  },

  methods: {
    add(item) {}
  }
}
</script>

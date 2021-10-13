<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <v-data-table
          :headers="headers"
          :hide-default-header="$vuetify.breakpoint.xsOnly"
          :items="datastreams"
          disable-pagination
          hide-default-footer
          item-key="_id"
        >
          <template #item.yAxis="{ item }" class="text-no-wrap px-0">
            <v-btn-toggle
              :value="getQuantity(item._id)"
              mandatory
              @change="
                setQuantity({
                  id: item._id,
                  value: $event
                })
              "
            >
              <v-btn :value="1" text small>Y1</v-btn>
              <v-btn :value="2" text small>Y2</v-btn>
            </v-btn-toggle>
          </template>

          <template #item.icons="{ item }" class="text-no-wrap">
            <v-icon
              color="tertiary"
              @click="
                setQuantity({
                  id: item._id,
                  value: 0
                })
              "
              >{{ mdiMinusCircle }}</v-icon
            >
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  props: {
    datastreams: { default: null, type: Array }
  },

  data: () => ({
    headers: [
      {
        align: 'center',
        sortable: false,
        text: 'Y-Axis',
        value: 'yAxis'
      },
      {
        align: 'left',
        text: 'Station',
        value: 'station_lookup.name',
        width: '20%'
      },
      {
        align: 'left',
        text: 'Datastream',
        value: 'name',
        width: '30%'
      },
      {
        align: 'left',
        text: 'Unit',
        value: 'terms.dt.Unit',
        width: '10%'
      },
      {
        align: 'right',
        value: 'icons'
      }
    ]
  }),

  computed: {
    ...mapGetters({
      getQuantity: 'cart/getQuantity'
    })
  },

  methods: {
    ...mapMutations({
      setQuantity: 'cart/setQuantity'
    })
  }
}
</script>

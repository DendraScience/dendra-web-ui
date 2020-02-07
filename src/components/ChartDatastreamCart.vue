<template>
  <v-container fluid>
    <feathers-vuex-find
      v-slot="{ items: datastreams }"
      :query="datastreamsQuery"
      watch="query"
      local
      service="datastreams"
    >
      <v-layout wrap>
        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :hide-default-header="$vuetify.breakpoint.xsOnly"
            :items="datastreams"
            disable-pagination
            disable-sort
            hide-default-footer
            item-key="_id"
          >
            <template v-slot:item.yAxis="{ item }" class="text-no-wrap px-0">
              <v-btn-toggle
                :value="item.quantitySelected"
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

            <template v-slot:item.icons="{ item }" class="text-no-wrap">
              <v-icon
                color="tertiary"
                @click="
                  setQuantity({
                    id: item._id,
                    value: 0
                  })
                "
                >mdi-minus-circle</v-icon
              >
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </feathers-vuex-find>
  </v-container>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  data: () => ({
    headers: [
      {
        align: 'center',
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
      cartIds: 'cart/ids'
    }),

    datastreamsQuery() {
      return {
        _id: { $in: this.cartIds },
        $sort: {
          nameWithStationAndUnit: 1
        }
      }
    }
  },

  methods: {
    ...mapMutations({
      setQuantity: 'cart/setQuantity'
    })
  }
}
</script>

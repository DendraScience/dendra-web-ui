<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout column>
          <v-flex>
            <!-- TODO: Remove elevation? -->
            <v-tabs v-model="tabIndex" class="qq-elevation-2" fixed-tabs>
              <v-tab>
                Search
              </v-tab>

              <v-tab-item>
                <v-card flat>
                  <v-card-title primary-title class="headline">
                    Annotations
                  </v-card-title>

                  <annotation-search
                    :org="org"
                    :station-id="
                      this.$route.query && this.$route.query.stationId
                    "
                  />

                  <v-card-actions>
                    <v-btn :disabled="!cartCount" @click="resetCart"
                      >Reset</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import AnnotationSearch from '@/components/AnnotationSearch'

import { mapGetters, mapMutations, mapState } from 'vuex'

export default {
  components: {
    AnnotationSearch
  },

  middleware: ['check-org'],

  data: () => ({
    tabIndex: 0
  }),

  computed: {
    ...mapGetters(['org']),
    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids'
    }),

    ...mapState('cart', ['quantitiesById'])
  },

  created() {
    this.resetCart()
  },

  methods: {
    ...mapMutations({
      resetCart: 'cart/reset',
      setQuantity: 'cart/setQuantity'
    })
  }
}
</script>

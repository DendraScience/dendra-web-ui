<template>
  <v-layout v-if="org" column>
    <v-btn color="secondary" dark fixed bottom left fab>
      <v-icon>add</v-icon>
    </v-btn>

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

                  <annotation-search :org="org">
                    <template v-slot:actions="{ item }">
                      <v-icon color="tertiary" @click="open(item._id)"
                        >open_in_new</v-icon
                      >
                    </template>
                  </annotation-search>
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
    }),

    open(annotationId) {
      window.open(
        this.$router.resolve({
          name: 'orgs-orgSlug-annotations-annotationId',
          params: {
            orgSlug: this.org.slug,
            annotationId
          }
        }).href,
        '_blank'
      )
    }
  }
}
</script>

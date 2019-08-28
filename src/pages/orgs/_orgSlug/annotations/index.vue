<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout column>
          <v-flex>
            <!-- TODO: Remove elevation? -->
            <v-tabs v-model="tabIndex" fixed-tabs>
              <v-tab>
                View
              </v-tab>

              <v-tab-item>
                <v-card flat>
                  <v-card-title class="headline">
                    Annotations
                  </v-card-title>

                  <annotation-search
                    :is-enabled="queryIsEnabled"
                    :org="org"
                    :show-disabled="$can('create', 'annotations')"
                    show-link
                  >
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

    <v-btn
      v-if="
        $can('create', {
          organization_id: org._id,
          state: 'pending',
          [$abilityTypeKey]: 'annotations'
        })
      "
      :to="{
        name: 'orgs-orgSlug-annotations-create',
        params: {
          orgSlug: org.slug
        }
      }"
      color="secondary"
      dark
      exact
      fab
      fixed
      nuxt
      right
      style="top: 80px;"
      top
    >
      <v-icon>add</v-icon>
    </v-btn>
  </v-layout>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import AnnotationSearch from '@/components/AnnotationSearch'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    AnnotationSearch
  },

  middleware: ['check-org'],

  data: () => ({
    tabIndex: 0
  }),

  computed: {
    // TODO: Remove cart helpers?
    ...mapGetters(['org']),
    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids'
    }),

    ...mapState('cart', ['quantitiesById']),

    queryIsEnabled() {
      return this.$route.query.isEnabled
    }
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

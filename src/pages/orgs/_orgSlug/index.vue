<template>
  <v-layout v-if="org" column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout>
          <v-flex xs12>
            <h2 class="display-3 font-weight-light mb-2">{{ org.name }}</h2>

            <p>
              {{ org.description }}
            </p>
          </v-flex>
        </v-layout>

        <v-layout wrap mt-6>
          <v-flex xs12 md4>
            <station-total
              :show-disabled="$can('create', 'stations')"
              :org="org"
            />
          </v-flex>

          <v-flex xs12 md4>
            <datastream-total
              :show-disabled="$can('create', 'datastreams')"
              :org="org"
            />
          </v-flex>
        </v-layout>

        <v-layout wrap>
          <v-flex xs12 md4>
            <annotation-total
              :show-disabled="$can('create', 'annotations')"
              :org="org"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import AnnotationTotal from '@/components/AnnotationTotal'
import DatastreamTotal from '@/components/DatastreamTotal'
import StationTotal from '@/components/StationTotal'

export default {
  components: {
    AnnotationTotal,
    DatastreamTotal,
    StationTotal
  },

  middleware: ['check-org'],

  computed: {
    ...mapGetters(['org'])
  }
}
</script>

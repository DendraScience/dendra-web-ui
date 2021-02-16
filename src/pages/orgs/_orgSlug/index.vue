<template>
  <v-container v-if="org">
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light my-2">{{ org.name }}</h2>

        <h3 v-if="org.description" class="subtitle-1 mb-2">
          {{ org.description }}
        </h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <station-total
          :show-disabled="$canCreate('stations', org)"
          :org="org"
        />
      </v-col>

      <v-col cols="12" md="4">
        <datastream-total
          :show-disabled="$canCreate('datastreams', org)"
          :org="org"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <annotation-total
          :show-disabled="$canCreate('annotations', org)"
          :org="org"
        />
      </v-col>
    </v-row>
  </v-container>
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

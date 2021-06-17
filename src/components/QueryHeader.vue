<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <h2 class="headline">
          <slot>Items</slot>
        </h2>
      </v-col>
    </v-row>

    <v-row v-if="hasQuery">
      <v-col>
        <v-card outlined>
          <v-card-subtitle>
            <h4 v-if="queryIsEnabled === true" class="subtitle-2">
              <v-icon class="mr-2" small>{{ mdiEngine }}</v-icon
              >Enabled
            </h4>
            <h4 v-if="queryIsEnabled === false" class="subtitle-2">
              <v-icon class="mr-2" small>{{ mdiEngineOff }}</v-icon
              >Disabled
            </h4>
            <h4 v-if="queryIsHidden === true" class="subtitle-2">
              <v-icon class="mr-2" small>{{ mdiEyeOff }}</v-icon
              >Hidden
            </h4>
            <h4 v-if="queryIsHidden === false" class="subtitle-2">
              <v-icon class="mr-2" small>{{ mdiEye }}</v-icon
              >Visible
            </h4>
            <h4 v-if="queryCompanyId" class="subtitle-2">
              <v-icon class="mr-2" small>{{ mdiOfficeBuilding }}</v-icon
              >Company:
              <nuxt-link
                :to="{
                  name: 'companies-companyId',
                  params: {
                    companyId: queryCompanyId
                  }
                }"
                class="font-weight-regular"
                >{{ getCompany(queryCompanyId) | companyName }}</nuxt-link
              >
            </h4>
            <h4 v-if="queryThingTypeId" class="subtitle-2">
              <v-icon class="mr-2" small>{{ mdiHexagonSlice6 }}</v-icon
              >Equipment:
              <nuxt-link
                :to="{
                  name: 'equipment-thingTypeId',
                  params: {
                    thingTypeId: queryThingTypeId
                  }
                }"
                class="font-weight-regular"
                >{{ getThingType(queryThingTypeId) | thingTypeName }}</nuxt-link
              >
            </h4>
            <h4 v-if="queryStationId && org" class="subtitle-2">
              <v-icon class="mr-2" small>{{ mdiNoteOutline }}</v-icon
              >Station:
              <nuxt-link
                :to="{
                  name: 'orgs-orgSlug-stations-stationId',
                  params: {
                    orgSlug: org.slug,
                    stationId: queryStationId
                  }
                }"
                class="font-weight-regular"
                >{{ getStation(queryStationId).name }}</nuxt-link
              >
            </h4>
            <h4 v-if="queryDatastreamId && org" class="subtitle-2">
              <v-icon class="mr-2" small>{{ mdiChartTimelineVariant }}</v-icon
              >Datastream:
              <nuxt-link
                :to="{
                  name: 'orgs-orgSlug-datastreams-datastreamId',
                  params: {
                    orgSlug: org.slug,
                    datastreamId: queryDatastreamId
                  }
                }"
                class="font-weight-regular"
                >{{ getDatastream(queryDatastreamId).name }}</nuxt-link
              >
            </h4>
            <h4 v-if="queryAnnotationId && org" class="subtitle-2">
              <v-icon class="mr-2" small>{{ mdiNoteOutline }}</v-icon
              >Annotation:
              <nuxt-link
                :to="{
                  name: 'orgs-orgSlug-annotations-annotationId',
                  params: {
                    orgSlug: org.slug,
                    annotationId: queryAnnotationId
                  }
                }"
                class="font-weight-regular"
                >{{ getAnnotation(queryAnnotationId).title }}</nuxt-link
              >
            </h4>
          </v-card-subtitle>

          <v-card-actions>
            <v-btn
              v-if="org"
              :to="{
                name: `orgs-orgSlug-${name}`,
                params: {
                  orgSlug: org.slug
                }
              }"
              exact
              text
              x-small
              >Show all <slot>Items</slot></v-btn
            >
            <v-btn
              v-else
              :to="{
                name
              }"
              exact
              text
              x-small
              >Show all <slot>Items</slot></v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import routeQuery from '@/mixins/route-query'

export default {
  mixins: [routeQuery],

  props: {
    name: { default: '', type: String },
    org: { default: null, type: Object }
  },

  computed: {
    ...mapGetters({
      getAnnotation: 'annotations/get',
      getCompany: 'companies/get',
      getDatastream: 'datastreams/get',
      getStation: 'stations/get',
      getThingType: 'thing-types/get'
    })
  }
}
</script>

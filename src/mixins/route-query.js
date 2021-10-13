import { queryIs } from '@/lib/utils'

export default {
  computed: {
    hasQuery() {
      const { query } = this.$route

      return (
        query.annotationId ||
        query.companyId ||
        query.datastreamId ||
        query.stationId ||
        query.thingTypeId ||
        query.isEnabled !== undefined ||
        query.isHidden !== undefined
      )
    },

    queryAnnotationId() {
      return this.$route.query.annotationId
    },

    queryCompanyId() {
      return this.$route.query.companyId
    },

    queryDatastreamId() {
      return this.$route.query.datastreamId
    },

    queryFaceted() {
      return queryIs(this.$route.query.faceted)
    },

    queryIsEnabled() {
      return queryIs(this.$route.query.isEnabled)
    },

    queryIsHidden() {
      return queryIs(this.$route.query.isHidden)
    },

    queryScheme() {
      return this.$route.query.scheme
    },

    queryStationId() {
      return this.$route.query.stationId
    },

    queryThingTypeId() {
      return this.$route.query.thingTypeId
    }
  }
}

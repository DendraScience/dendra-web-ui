<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <feathers-vuex-find
          v-slot="{ isFindPending: loading, items: annotations, pagination }"
          :fetch-query="annotationsFetchQuery"
          :qid="qid"
          :query="annotationsQuery"
          :watch="['fetchQuery.$and', 'fetchQuery.$limit', 'fetchQuery.$skip']"
          service="annotations"
        >
          <v-data-table
            :footer-props="{ itemsPerPageOptions: [10, 20, 50] }"
            :headers="headers"
            :items="annotations"
            :loading="loading"
            :options.sync="tableOptions"
            :server-items-length="pagination ? pagination.total : 0"
            dense
            disable-sort
            item-key="_id"
          >
            <template #item.title="{ item }">
              <nuxt-link
                v-if="showLink"
                :to="{
                  name: 'orgs-orgSlug-annotations-annotationId',
                  params: {
                    orgSlug: org.slug,
                    annotationId: item._id
                  }
                }"
                >{{ item.title }}</nuxt-link
              ><span v-else>{{ item.title }}</span>
            </template>

            <template #item.actions="{ item }">
              {{ actionsToString(item.actions) }}
            </template>

            <template #item.icons="{ item }">
              <span class="text-no-wrap">
                <v-icon color="tertiary" @click="open(item._id)">{{
                  mdiOpenInNew
                }}</v-icon>
              </span>
            </template>
          </v-data-table>
        </feathers-vuex-find>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  components: {},

  props: {
    datastreams: { default: () => [], type: Array },
    org: { default: null, type: Object },
    qid: { default: 'chart', type: String },
    showLink: { default: false, type: Boolean },
    startTime: { default: 0, type: Number },
    untilTime: { default: 0, type: Number }
  },

  data: () => ({
    dateRange: {
      from: null,
      to: null
    },

    headers: [
      {
        align: 'left',
        text: 'Annotation',
        value: 'title',
        width: '40%'
      },
      {
        align: 'left',
        text: 'Actions',
        value: 'actions'
      },
      {
        align: 'right',
        value: 'icons',
        width: '5%'
      }
    ],

    queryAnnotationIds: [],

    tableOptions: {
      page: 1,
      itemsPerPage: 10,
      totalItems: null
    }
  }),

  computed: {
    annotationsFetchQuery() {
      const { tableOptions } = this
      const { page, itemsPerPage } = tableOptions

      const query = {
        organization_id: this.org._id,
        $limit: itemsPerPage,
        $skip: (page - 1) * itemsPerPage,
        $select: ['_id', 'actions', 'intervals', 'title'],
        $sort: {
          'intervals.0.begins_at': 1,
          'intervals.0.ends_before': 1,
          _id: 1
        }
      }

      const ands = []

      ands.push({ is_enabled: true })
      ands.push({ state: 'approved' })

      const ors = []
      const stations = new Map()

      for (const datastream of this.datastreams) {
        if (datastream.station_id && datastream.station_lookup) {
          stations.set(datastream.station_id, datastream.station_lookup)
          const offset = datastream.station_lookup.utc_offset * 1000
          ors.push({
            datastream_ids: datastream._id,
            intervals: {
              $elemMatch: {
                begins_at: {
                  $lt: new Date(this.untilTime - offset).toISOString()
                },
                ends_before: {
                  $gt: new Date(this.startTime - offset).toISOString()
                }
              }
            }
          })
        }
      }

      for (const [stationId, station] of stations.entries()) {
        const offset = station.utc_offset * 1000
        ors.push({
          station_ids: stationId,
          intervals: {
            $elemMatch: {
              begins_at: {
                $lt: new Date(this.untilTime - offset).toISOString()
              },
              ends_before: {
                $gt: new Date(this.startTime - offset).toISOString()
              }
            }
          }
        })
      }

      if (ors.length) {
        ands.push({ $or: ors })
      } else {
        query.$limit = 0
      }

      query.$and = ands

      return query
    },

    paginationSearch() {
      return this.$store.state.annotations.pagination[this.qid]
    },

    annotationsQuery() {
      return {
        _id: { $in: this.queryAnnotationIds },
        $sort: {
          'intervals.0.begins_at': 1,
          'intervals.0.ends_before': 1,
          _id: 1
        }
      }
    }
  },

  watch: {
    paginationSearch(newValue) {
      this.queryAnnotationIds = (newValue && newValue.ids) || []
    }
  },

  methods: {
    actionsToString(actions) {
      if (!actions) return 'None'

      return actions
        .map((item, key) => {
          if (item.attrib !== undefined) {
            return 'Attrib datastreams'
          }
          if (item.evaluate !== undefined) {
            return 'Evaluate datapoints'
          }
          if (item.exclude !== undefined) {
            return 'Exclude datapoints'
          }
          if (item.flag !== undefined) {
            return `Flag datapoints: ${item.flag}`
          }
          return 'Custom action'
        })
        .join(', ')
    },

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

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      findDownloads: 'downloads/find'
    }),

    errorDownloads() {
      return this.findDownloads({
        query: { state: 'error', $sort: { _id: -1 } }
      }).data
    },

    pendingDownloads() {
      return this.findDownloads({
        query: {
          state: { $in: ['pending', 'queued', 'running'] },
          $sort: { _id: -1 }
        }
      }).data
    },

    readyDownloads() {
      return this.findDownloads({
        query: {
          'result_post.presigned_get_info.expires_date': {
            $gt: new Date().toISOString()
          },
          state: 'completed',
          $sort: { _id: -1 }
        }
      }).data
    }
  }
}

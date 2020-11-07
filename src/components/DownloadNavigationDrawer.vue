<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    dark
    hide-overlay
    right
    temporary
    width="600"
  >
    <v-toolbar color="primary darken-2" dark flat>
      <v-btn icon dark @click="drawer = false">
        <v-icon>{{ mdiClose }}</v-icon>
      </v-btn>
      <v-toolbar-title>Downloads</v-toolbar-title>
    </v-toolbar>

    <v-list subheader two-line>
      <template v-if="pendingDownloads.length">
        <v-subheader inset
          >Being processed (updated
          {{ fetchDate | dateTimeFormatLocal }})</v-subheader
        >
        <v-list-item
          v-for="download in pendingDownloads"
          :key="download._id"
          three-line
        >
          <v-list-item-avatar>
            <v-icon class="warning pa-2" dark>{{ mdiFileClock }}</v-icon>
          </v-list-item-avatar>
          <download-item-content :value="download" show-progress />
        </v-list-item>
      </template>
      <v-subheader v-else inset>No downloads processing</v-subheader>

      <v-divider inset></v-divider>

      <template v-if="readyDownloads.length">
        <v-subheader inset>Ready to download</v-subheader>
        <v-list-item
          v-for="download in readyDownloads"
          :key="download._id"
          :href="download.result_post.presigned_get_info.url"
          link
          target="_blank"
          three-line
        >
          <v-list-item-avatar>
            <v-icon class="info pa-2" dark>{{ mdiFileDownload }}</v-icon>
          </v-list-item-avatar>
          <download-item-content :value="download" />
        </v-list-item>
      </template>
      <v-subheader v-else inset>No items to download</v-subheader>

      <v-divider inset></v-divider>

      <template v-if="errorDownloads.length">
        <v-subheader inset>Errors</v-subheader>
        <v-list-item
          v-for="download in errorDownloads"
          :key="download._id"
          three-line
        >
          <v-list-item-avatar>
            <v-icon class="error pa-2" dark>{{ mdiFileAlert }}</v-icon>
          </v-list-item-avatar>
          <download-item-content :value="download" />
        </v-list-item>
      </template>
      <v-subheader v-else inset>No errors</v-subheader>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import downloads from '@/mixins/downloads'
import timer from '@/mixins/timer'
import DownloadItemContent from '@/components/DownloadItemContent'

export default {
  components: {
    DownloadItemContent
  },

  mixins: [downloads, timer],

  fetch() {
    this.fetchDate = new Date()

    return this.fetchDownloads({
      query: {
        $limit: 200,
        $sort: { _id: -1 }
      }
    })
  },

  data() {
    return {
      fetchDate: null,

      timerInterval: 60000
    }
  },

  computed: {
    ...mapState(['auth']),

    drawer: {
      set(value) {
        this.$store.commit('ux/setDownloadDrawer', value)
      },
      get() {
        return this.$store.state.ux.downloadDrawer
      }
    }
  },

  watch: {
    auth: {
      handler(newValue) {
        this.fetchDelayed()
      },
      deep: true
    },

    drawer: {
      handler(newValue) {
        if (newValue) this.fetchDelayed()
      }
    }
  },

  methods: {
    ...mapActions({
      fetchDownloads: 'downloads/find'
    }),

    fetchDelayed() {
      this.clearTimer()
      setTimeout(() => {
        this.$fetch().finally(() => this.resetTimer())
      }, 2000)
    },

    timerCallback() {
      return this.pendingDownloads.length ? this.$fetch() : Promise.resolve()
    }
  }
}
</script>

<template>
  <v-app light>
    <main-navigation-drawer />
    <main-toolbar />

    <v-app-bar
      v-show="editing"
      :color="editorColor"
      app
      dark
      dense
      fixed
      style="margin-top: 64px;"
    >
      <v-toolbar-title>{{ editorTitle }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn
          :disabled="editorDirty < 1"
          text
          @click="$bus.$emit('editor-save')"
          >Save</v-btn
        >
        <v-btn text @click="cancel">Cancel</v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <status-bar v-model="status" />

      <v-container :style="editing ? { marginTop: '48px' } : {}" fluid pa-0>
        <nuxt />
      </v-container>
    </v-content>

    <v-dialog v-model="cancelDialog" dark max-width="500px" persistent>
      <v-card>
        <v-card-title class="headline">
          Unsaved changes
        </v-card-title>

        <v-card-text>
          You have unsaved changes. Do you really want to discard them?
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="cancelDialogClick(false)"
            >Stay Here</v-btn
          >
          <v-btn @click="cancelDialogClick(true)">Discard</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="leaveDialog" dark max-width="500px" persistent>
      <v-card>
        <v-card-title class="headline">
          Unsaved changes
        </v-card-title>

        <v-card-text>
          You have unsaved changes. Do you really want to leave this page?
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="leaveDialogClick(false)"
            >Stay on Page</v-btn
          >
          <v-btn @click="leaveDialogClick(true)">Leave Page</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <session-expired-dialog @status="status = $event" />
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
import MainNavigationDrawer from '@/components/MainNavigationDrawer'
import MainToolbar from '@/components/MainToolbar'
import SessionExpiredDialog from '@/components/SessionExpiredDialog.vue'
import StatusBar from '@/components/StatusBar'

export default {
  components: {
    MainNavigationDrawer,
    MainToolbar,
    SessionExpiredDialog,
    StatusBar
  },

  data: () => ({
    cancelDialog: false,
    leaveDialog: false,
    status: null
  }),

  computed: {
    ...mapState('ux', ['editing', 'editorColor', 'editorDirty', 'editorTitle'])
  },

  watch: {
    editing(newValue) {
      if (newValue) {
        this.$vuetify.goTo(0)

        // Follow SPA best practices -- virtual pageviews
        // SEE: https://developers.google.com/analytics/devguides/collection/gtagjs/single-page-applications
        const route = this.$route
        this.$tracker.pageView({ name: route.name, path: `${route.path}/edit` })
      }
    }
  },

  mounted() {
    this.$bus.$on('edit-leave', this.onLeave)
    this.$bus.$on('edit-status', this.onStatus)
  },

  beforeDestroy() {
    this.$bus.$off('edit-leave', this.onLeave)
    this.$bus.$off('edit-status', this.onStatus)
  },

  methods: {
    cancel() {
      if (this.editorDirty > 0) {
        this.cancelDialog = true
      } else {
        this.$bus.$emit('editor-cancel')
      }
    },

    cancelDialogClick(proceed) {
      this.cancelDialog = false
      if (proceed) this.$bus.$emit('editor-cancel')
    },

    leaveDialogClick(proceed) {
      this.leaveDialog = false
      this.leaveNext(proceed)
      this.leaveNext = null
    },

    onLeave({ next }) {
      if (this.leaveNext) {
        this.leaveNext(false)
        this.leaveNext = next
      } else if (this.editorDirty > 0) {
        this.leaveDialog = true
        this.leaveNext = next
      } else {
        next()
      }
    },

    onStatus(value) {
      this.status = value
    }
  }
}
</script>

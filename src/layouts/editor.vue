<template>
  <v-app light>
    <main-navigation-drawer />
    <main-toolbar />

    <v-toolbar
      v-show="editing"
      :color="editorColor"
      app
      dark
      dense
      fixed
      style="margin-top: 64px;"
    >
      <v-toolbar-title v-if="editorTitle">{{ editorTitle }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn
          :disabled="editorDirty < 1"
          flat
          @click="$bus.$emit('editor-save')"
          >Save</v-btn
        >
        <v-btn flat @click="cancel">Cancel</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content :style="editing ? { marginTop: '48px' } : {}">
      <status-bar v-model="status" />

      <v-container fluid pa-0>
        <nuxt />
      </v-container>
    </v-content>

    <v-dialog v-model="cancelDialog" dark max-width="500px" persistent>
      <v-card>
        <v-card-title primary-title class="headline">
          Unsaved changes
        </v-card-title>

        <v-card-text>
          You have unsaved changes. Do you really want to discard them?
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="cancelDialogClick(true)"
            >Discard</v-btn
          >
          <v-btn @click="cancelDialogClick(false)">Stay Here</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="leaveDialog" dark max-width="500px" persistent>
      <v-card>
        <v-card-title primary-title class="headline">
          Unsaved changes
        </v-card-title>

        <v-card-text>
          You have unsaved changes. Do you really want to leave this page?
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="leaveDialogClick(true)"
            >Leave Page</v-btn
          >
          <v-btn @click="leaveDialogClick(false)">Stay on Page</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import MainNavigationDrawer from '@/components/MainNavigationDrawer'
import MainToolbar from '@/components/MainToolbar'
import StatusBar from '@/components/StatusBar'

import { mapState } from 'vuex'

export default {
  components: {
    MainNavigationDrawer,
    MainToolbar,
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

<template>
  <v-layout v-if="annotation" column pt-3>
    <status-bar v-model="status" />

    <v-flex>
      <v-container grid-list-xl>
        <v-layout v-if="!editing" row wrap>
          <v-flex grow>
            <h4 class="display-1 font-weight-light mb-2">Annotation details</h4>
          </v-flex>

          <v-flex shrink>
            <v-btn color="primary" @click="setEditing(true)">Edit</v-btn>
          </v-flex>
        </v-layout>

        <v-layout column>
          <v-flex>
            <annotation-detail
              :annotation="annotation"
              :editing="editing"
              @status="status = $event"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import AnnotationDetail from '@/components/AnnotationDetail'
import StatusBar from '@/components/StatusBar'

import { mapGetters, mapState, mapMutations } from 'vuex'

export default {
  components: {
    AnnotationDetail,
    StatusBar
  },

  layout: 'editor',

  middleware: ['check-org', 'check-annotation', 'reset-editing'],

  data: () => ({
    status: null
  }),

  computed: {
    ...mapGetters(['org', 'annotation']),

    ...mapState('ux', ['editing'])
  },

  mounted() {
    this.$bus.$on('editor-cancel', this.cancel)
    this.$bus.$on('editor-save', this.save)
  },

  beforeDestroy() {
    this.$bus.$off('editor-cancel', this.cancel)
    this.$bus.$off('editor-save', this.save)
  },

  methods: {
    ...mapMutations({
      setEditing: 'ux/setEditing'
    }),

    cancel() {
      this.setEditing(false)
    },

    save() {
      this.status = {
        message:
          'That was awesome super super awesome because you are a rockstar mister all day long!',
        type: 'success'
      }
      this.setEditing(false)
    }
  }
}
</script>

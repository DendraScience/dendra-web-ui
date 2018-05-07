<template>
  <div class="pt-header pb-4">
    <section v-if="currentDashboard">
      <div class="container-fluid">
        <div class="row py-2 border-bottom-darken-10">
          <div class="col-12 text-muted">{{ currentDashboard.name }} Dashboard</div>
        </div>
      </div>
    </section>

    <section v-if="!isLoading && errorChannels && errorChannels.length">
      <div class="alert alert-danger" role="alert">
        <h4>Oops!</h4>
        <ul>
          <li v-for="channel in errorChannels">
            There was a problem loading data for topic <strong>{{ channel.topic }}</strong>,
            {{ channel.error.message }}
            {{ channel.error.data && channel.error.data.error ? `(${channel.error.data.error})` : '' }}
          </li>
        </ul>
      </div>
    </section>

    <section class="py-3" v-if="currentDashboard && currentDashboard.content">
      <div class="container-fluid">
        <div class="row" :class="row.classes" :style="row.style"
          v-if="currentDashboard.content.rows"
          v-for="row in currentDashboard.content.rows">

          <div class="col-12" v-if="row.title">
            <h2>{{ row.title }}</h2>
          </div>

          <div :class="column.classes" :style="column.style" v-if="row.columns" v-for="column in row.columns">
            <h3 class="text-muted" v-if="column.title">{{ column.title }}</h3>

            <component :is="column.component.name"
              :channel="getChannel(column.component.topic)"
              :options="Object.freeze(column.component.options)"
              v-if="column.component" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import {GenericSource, InitialSources, SourceTemplates} from '@/lib/dashboard'
import {TaskMachine} from '@dendra-science/task-machine'
import HcTimeSeries from '@/components/dashboard/HcTimeSeries'

// TODO: Handle sync extremes for charts

export default {
  components: {
    HcTimeSeries
  },

  middleware: [
    'check-org',
    'check-org-dash'
  ],

  data () {
    return {
      isLoading: false
    }
  },

  created () {
    this.initTopics(this.currentDashboard.sources.map(source => source.topic))
  },

  mounted () {
    this.loadData()
  },

  beforeDestroy () {
    this.clearReloadTimer()
    this.clearAllChannels()
    this.destroyLoader()
  },

  computed: {
    ...mapGetters({
      currentDashboard: 'dashboards/current',
      getChannel: 'channels/get',
      listChannels: 'channels/list'
    }),

    errorChannels () {
      return this.listChannels.filter(channel => !channel.errorLimit)
    }
  },

  methods: {
    ...mapMutations({
      clearAllChannels: 'channels/clearAll',
      initTopics: 'channels/initTopics'
    }),

    clearReloadTimer () {
      if (this.reloadTid) clearInterval(this.reloadTid)
      this.reloadTid = null
    },

    startReloadTimer () {
      this.clearReloadTimer()

      // Update data every 10 minutes
      this.reloadTid = setTimeout(() => {
        this.reloadTid = null
        this.reloadData()
      }, 600000)
    },

    destroyLoader () {
      if (this.loader) this.loader.destroy()
      this.loader = null
    },

    loadData () {
      this.clearReloadTimer()
      this.destroyLoader()

      const dashboard = this.currentDashboard

      if (!(dashboard && dashboard.sources)) return

      this.loader = new TaskMachine({
        $store: this.$store
      }, dashboard.sources.reduce((sources, spec) => {
        const t = spec.template || '_default'
        sources[spec.key || spec.topic] = Object.assign({}, GenericSource, {
          $spec: SourceTemplates[t] ? Object.assign({}, SourceTemplates[t], spec) : spec
        })
        return sources
      }, Object.assign({}, InitialSources)), {
        interval: 1200,

        // Allow for 100 series * 10 fetches each * 10 attempts
        maxExecutions: 10000
      })

      return this.reloadData()
    },

    reloadData () {
      this.clearReloadTimer()

      const loader = this.loader

      if (!loader) return

      this.isLoading = true

      return loader.clear().start().then(success => {
        this.isLoading = false
        this.startReloadTimer()
      })
    }
  },

  watch: {
    $route: 'loadData',

    currentDashboard: 'loadData'
  }
}
</script>

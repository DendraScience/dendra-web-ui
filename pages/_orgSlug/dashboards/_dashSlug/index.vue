<template>
  <div class="pt-header pb-4">
    <section v-if="current">
      <div class="container-fluid">
        <div class="row py-2 border-bottom-darken-10">
          <div class="col-12 text-muted">{{ current.name }} Dashboard</div>
        </div>
      </div>
    </section>

    <section class="py-3" v-if="current && current.content">
      <div class="container-fluid">
        <div class="row" :class="row.classes" :style="row.style"
          v-if="current.content.rows"
          v-for="row in current.content.rows">

          <div class="col-12" v-if="row.title">
            <h2>{{ row.title }}</h2>
          </div>

          <div :class="col.classes" :style="col.style" v-if="row.cols" v-for="col in row.cols">
            <h3 v-if="col.title">{{ col.title }}</h3>

            <component :is="col.component.name"
              :channel="$store.state.dashboard.channels[col.component.topic]"
              :options="Object.freeze(col.component.options)"
              v-if="col.component" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'

import Highchart from '../../../../components/dashboard/Highchart'

// TODO: Move dataloader hooks, etc. to module files
// TODO: Rename Highchart to DatapointsChart?
// TODO: Handle sync extremes for charts

const DL_CLEAR_HOOKS = {
  channel (config, model) {
    model.$store.dispatch('dashboard/clearChannel', {
      config: config
    })
  }
}

const DL_GUARD_HOOKS = {
  seriesAsc (config, model) {
    return model.$store.getters['dashboard/guardSeriesAsc'](config.topic)
  }
}

const DL_BEFORE_FETCH_HOOKS = {
  seriesAsc (config, model) {
    model.$store.dispatch('dashboard/beforeFetchSeriesAsc', {
      config: config
    })
  }
}

const DL_QUERY_BUILDERS = {
  seriesAsc (config, model, params) {
    const opts = config.options
    const cursor = model.$store.state.dashboard.channels[config.topic].cursor

    return Object.assign({
      time: {
        $gte: cursor.start.toISOString(),
        $lt: cursor.pos.toISOString()
      },
      time_local: !(opts && opts.useWallTime === true),
      $limit: 2000,
      $sort: {time: 1} // ASC
    }, params)
  }
}

const DL_FETCH_HOOKS = {
  result (config, model) {
    let result = []
    let step = Promise.resolve()

    /*
      Set up a promise chain to find and concatenate multiple results.
     */
    config.fetch_queries.forEach(query => {
      const service = model.$root.$options.$services[query.service]
      if (!service) return

      const builder = DL_QUERY_BUILDERS[config.query_builder]
      if (!builder) return

      step = step.then(() => {
        return service.find({
          query: builder(config, model, query.params)
        })
      }).then(res => {
        // TODO: Deal with options: placeholder, sortByAttributes
        if (Array.isArray(res) && res.length > 0) {
          result = result.concat(res)
        }
      })
    })

    return step.then(() => {
      return result
    })
  }
}

const DL_AFTER_FETCH_HOOKS = {
  seriesAsc (config, model, res) {
    return res
  }
}

const DL_ASSIGN_HOOKS = {
  result (config, model, res) {
    model.$store.dispatch('dashboard/assignResult', {
      config: config,
      result: res
    })
  }
}

const INITIAL_SOURCES = {
  systemTime: {
    clear (model) {
      model.$store.dispatch('dashboard/clearSystemTime')
    },
    guard (model) {
      return !model.$store.state.dashboard.systemTime
    },
    fetch (model) {
      return model.$root.$options.$services.systemTime.get('utc')
    },
    assign (model, res) {
      model.$store.dispatch('dashboard/assignSystemTime', res)
    }
  }
}

const SOURCE_CONFIG_TEMPLATES = {
  _default: {
    // TODO: Define default configuration
  },
  seriesAsc: {
    clear: 'channel',
    guard: 'seriesAsc',
    before_fetch: 'seriesAsc',
    fetch: 'result',
    fetch_queries: [],
    query_builder: 'seriesAsc',
    after_fetch: 'seriesAsc',
    assign: 'result'
  }
}

const SOURCE_TEMPLATE = {
  clear (model) {
    const [config, k, H] = [this.$config, this.$config.clear, DL_CLEAR_HOOKS]
    if (k && H[k]) H[k](config, model)
  },
  guard (model) {
    const [config, k, H] = [this.$config, this.$config.guard, DL_GUARD_HOOKS]
    return k && H[k] ? H[k](config, model) : true
  },
  beforeFetch (model) {
    const [config, k, H] = [this.$config, this.$config.before_fetch, DL_BEFORE_FETCH_HOOKS]
    if (k && H[k]) H[k](config, model)
  },
  fetch (model) {
    const [config, k, H] = [this.$config, this.$config.fetch, DL_FETCH_HOOKS]
    return k && H[k] ? H[k](config, model) : Promise.resolve()
  },
  afterFetch (model, res) {
    const [config, k, H] = [this.$config, this.$config.after_fetch, DL_AFTER_FETCH_HOOKS]
    return k && H[k] ? H[k](config, model, res) : res
  },
  assign (model, res) {
    const [config, k, H] = [this.$config, this.$config.assign, DL_ASSIGN_HOOKS]
    if (k && H[k]) H[k](config, model, res)
  }
}

export default {
  components: {
    Highchart
  },

  data () {
    return {
      dataLoading: false
    }
  },

  middleware: 'check-org',

  fetch ({error, params, store}) {
    const dashboard = store.getters.getDashboardBySlug(params.dashSlug)

    if (dashboard) {
      store.dispatch('dashboard/setCurrent', dashboard)
    } else {
      store.dispatch('dashboard/clearCurrent')

      error({
        statusCode: 404,
        message: 'Dashboard not found.'
      })
    }
  },

  mounted () {
    this.loadData()
  },

  beforeDestroy () {
    if (this.dataLoader) {
      this.dataLoader.destroy()
      this.dataLoader = null
    }
  },

  computed: {
    ...mapGetters({
      current: 'dashboard/current',
      name: 'dashboard/name'
    })
  },

  methods: {
    loadData () {
      if (this.dataLoader) {
        this.dataLoader.destroy()
        this.dataLoader = null
      }

      if (this.current && this.current.sources) {
        this.dataLoader = new this.$root.$options.$dataloader.DataLoader(this, this.current.sources.reduce((sources, config) => {
          const t = config.template || '_default'
          sources[config.key || config.topic] = Object.assign({}, SOURCE_TEMPLATE, {
            $config: SOURCE_CONFIG_TEMPLATES[t] ? Object.assign({}, SOURCE_CONFIG_TEMPLATES[t], config) : config
          })
          return sources
        }, Object.assign({}, INITIAL_SOURCES)))

        this.dataLoader.clear().load().then(() => {
          this.$root.$options.$logger.log('_dashSlug:methods.loadData::vm', this)
        })
      }
    }
  },

  watch: {
    $route: 'loadData'
  }
}
</script>

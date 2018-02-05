import afterFetchHooks from './afterFetchHooks'
import assignHooks from './assignHooks'
import beforeFetchHooks from './beforeFetchHooks'
import clearHooks from './clearHooks'
import fetchHooks from './fetchHooks'
import guardHooks from './guardHooks'

export default {
  clear (model) {
    const spec = this.$spec
    const k = this.$spec.clear_hook
    const H = clearHooks

    if (k && H[k]) H[k](spec, model)
  },

  guard (model) {
    const spec = this.$spec
    const k = this.$spec.guard_hook
    const H = guardHooks

    return k && H[k] ? H[k](spec, model) : true
  },

  beforeExecute (model) {
    const spec = this.$spec
    const k = this.$spec.before_fetch_hook
    const H = beforeFetchHooks

    if (k && H[k]) H[k](spec, model)
  },

  execute (model) {
    const spec = this.$spec
    const k = this.$spec.fetch_hook
    const H = fetchHooks

    return k && H[k] ? H[k](spec, model) : Promise.resolve()
  },

  afterExecute (model, res) {
    const spec = this.$spec
    const k = this.$spec.after_fetch_hook
    const H = afterFetchHooks

    return k && H[k] ? H[k](spec, model, res) : res
  },

  assign (model, res) {
    const spec = this.$spec
    const k = this.$spec.assign_hook
    const H = assignHooks

    if (k && H[k]) H[k](spec, model, res)
  }
}

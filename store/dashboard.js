import logger from '@dendra-science/console-logger'
import moment from 'moment'

const OP_METHOD_REGEX = /^(add|endOf|set|startOf|subtract)$/

/**
 * Manipulate a moment given an array of operations.
 */
function manipulateMoment (value, ops) {
  ops.forEach(op => {
    try {
      if (!OP_METHOD_REGEX.test(op.m)) {
        // No-op
      } else if (Array.isArray(op.p)) {
        value[op.m](...op.p)
      } else {
        value[op.m](op.p)
      }
    } catch (err) {
      logger.error(`store/dashboard:manipulateMoment::err`, err)
    }
  })

  return value
}

export const state = () => ({
  channels: {},
  current: null,
  systemTime: null
})

export const getters = {
  current (state) {
    return state.current
  },

  guardSeriesAsc: (state) => (topic) => {
    const cursor = state.channels[topic].cursor
    return (typeof state.systemTime === 'number') && (!cursor || (cursor.start < cursor.end))
  },

  hasCurrent (state) {
    return !!state.current
  },

  name (state, getters) {
    return getters.hasCurrent ? state.current.name : null
  },

  slug (state, getters) {
    return getters.hasCurrent ? state.current.slug : null
  }
}

export const actions = {
  assignResult ({commit, state}, {config, result}) {
    commit('setResult', {
      topic: config.topic,
      result: result
    })

    /*
      Move the cursor for incremental fetching.
     */
    const opts = config.options
    const cursor = state.channels[config.topic].cursor

    if (cursor) {
      const newCursor = {}

      if (opts && opts.cursorDate && Array.isArray(result) && result.length > 0) {
        newCursor.start = cursor.pos.clone()
        newCursor.pos = cursor.pos.clone()
        newCursor.end = cursor.end.clone()

        manipulateMoment(newCursor.pos, opts.cursorDate)

        // Clamp pos to the end time
        newCursor.pos = moment.min(newCursor.pos, newCursor.end)
      } else {
        newCursor.start = newCursor.pos = newCursor.end = cursor.end.clone()
      }

      commit('setCursor', {
        topic: config.topic,
        cursor: newCursor
      })
    }
  },

  assignSystemTime ({commit}, res) {
    if (res && res.now) {
      commit('setSystemTime', (new Date(res.now)).getTime())
    } else {
      commit('clearSystemTime')
    }
  },

  beforeFetchSeriesAsc ({commit, state}, {config}) {
    const opts = config.options

    if (!state.channels[config.topic].range) {
      /*
        Compute the range for the entire series to be fetched.
       */
      const range = {}

      if (opts && opts.useWallTime === true) {
        // Wall time is based on the user's local timezome
        const time = state.systemTime
        range.start = moment(time)
        range.end = moment(time)
      } else {
        // Default is local time, based on the dashboard's offset
        const offset = state.current.utc_offset
        const time = state.systemTime + (typeof offset === 'number' ? offset * 1000 : 0)
        range.start = moment(time).utc()
        range.end = moment(time).utc()
      }

      if (opts) {
        if (opts.startDate) manipulateMoment(range.start, opts.startDate)
        if (opts.endDate) manipulateMoment(range.end, opts.endDate)
      }

      commit('setRange', {
        topic: config.topic,
        range: range
      })
    }

    if (!state.channels[config.topic].cursor) {
      /*
        Compute the cursor for incremental fetching.
       */
      const range = state.channels[config.topic].range
      const cursor = {}

      cursor.start = range.start.clone()
      cursor.pos = range.start.clone()
      cursor.end = range.end.clone()

      if (opts) {
        if (opts.cursorDate) manipulateMoment(cursor.pos, opts.cursorDate)
      }

      commit('setCursor', {
        topic: config.topic,
        cursor: cursor
      })
    }
  },

  clearChannel ({commit}, {config}) {
    commit('clearChannel', config.topic)
  },

  clearCurrent ({commit}) {
    commit('clearChannels')
    commit('clearCurrent')
  },

  clearSystemTime ({commit}) {
    commit('clearSystemTime')
  },

  setCurrent ({commit}, current) {
    commit('setCurrent', current)

    if (current.sources) {
      commit('setChannels', current.sources.reduce((channels, source) => {
        channels[source.topic] = {
          cursor: null,
          range: null,
          result: null
        }
        return channels
      }, {}))
    } else {
      commit('clearChannels')
    }
  }
}

export const mutations = {
  clearChannel (state, topic) {
    state.channels[topic] = {
      cursor: null,
      range: null,
      result: null
    }
  },

  clearChannels (state) {
    state.channels = {}
  },

  clearCurrent (state) {
    state.current = null
  },

  clearSystemTime (state) {
    state.systemTime = null
  },

  setChannels (state, channels) {
    state.channels = channels
  },

  setCurrent (state, current) {
    state.current = current
  },

  setCursor (state, {topic, cursor}) {
    state.channels[topic].cursor = Object.freeze(cursor)
  },

  setRange (state, {topic, range}) {
    state.channels[topic].range = Object.freeze(range)
  },

  setResult (state, {topic, result}) {
    state.channels[topic].result = Object.freeze(result)
  },

  setSystemTime (state, time) {
    state.systemTime = time
  }
}

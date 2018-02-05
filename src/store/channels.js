import Vue from 'vue'

function newChannel () {
  return {
    cursor: null,
    range: null,
    result: null
  }
}

export const state = () => ({
  keyedByTopic: {}
})

export const getters = {
  get: (state) => (topic) => {
    return state.keyedByTopic[topic]
  }
}

export const mutations = {
  clearAll (state) {
    state.keyedByTopic = {}
  },

  initTopic (state, topic) {
    Vue.set(state.keyedByTopic, topic, newChannel())
  },

  initTopics (state, topics) {
    topics.forEach(topic => (Vue.set(state.keyedByTopic, topic, newChannel())))
  },

  setCursor (state, {topic, cursor}) {
    state.keyedByTopic[topic].cursor = Object.freeze(cursor)
  },

  setRange (state, {topic, range}) {
    state.keyedByTopic[topic].range = Object.freeze(range)
  },

  setResult (state, {topic, result}) {
    state.keyedByTopic[topic].result = Object.freeze(result)
  }
}

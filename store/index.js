export const state = () => ({
  dashboards: [],
  organizations: []
})

export const getters = {
  getDashboardBySlug: (state, getters) => (slug) => {
    return state.dashboards.find(dashboard => dashboard.slug === slug)
  },

  hasDashboards (state) {
    return state.dashboards && state.dashboards.length > 0
  }
}

export const actions = {
  clearDashboards ({commit}) {
    commit('dashboard/clearCurrent')
    commit('clearDashboards')
  },

  clearOrganizations ({commit}) {
    commit('organization/clearCurrent')
    commit('clearOrganizations')
  },

  setDashboards ({commit}, dashboards) {
    commit('dashboard/clearCurrent')
    commit('setDashboards', dashboards)
  },

  setOrganizations ({commit}, organizations) {
    commit('organization/clearCurrent')
    commit('setOrganizations', organizations)
  }
}

export const mutations = {
  clearDashboards (state) {
    state.dashboards = []
  },

  clearOrganizations (state) {
    state.organizations = []
  },

  setDashboards (state, dashboards) {
    state.dashboards = dashboards
  },

  setOrganizations (state, organizations) {
    state.organizations = organizations
  }
}

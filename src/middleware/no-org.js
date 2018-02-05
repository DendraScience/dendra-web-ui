export default function ({store}) {
  store.commit('dashboards/clearCurrent')
  store.commit('organizations/clearCurrent')
}

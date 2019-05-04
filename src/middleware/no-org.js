export default function({ store }) {
  store.commit('clearDatastream')
  store.commit('clearStation')
  store.commit('clearOrg')
}

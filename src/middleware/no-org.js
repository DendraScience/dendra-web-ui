export default function({ store }) {
  store.commit('clearAnnotation')
  store.commit('clearDatastream')
  store.commit('clearStation')
  store.commit('clearOrg')
}

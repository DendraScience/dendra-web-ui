import hybridStorage from '@/lib/hybrid-storage'

export default () => {
  return {
    setLocal(_, value) {
      hybridStorage.local = value
    },

    setTokenExpired(state) {
      state.isTokenExpired = true
    },

    unsetTokenExpired(state) {
      state.isTokenExpired = false
    }
  }
}

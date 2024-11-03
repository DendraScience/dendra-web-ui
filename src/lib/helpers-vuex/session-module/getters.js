import hybridStorage from '@/lib/hybrid-storage'

export default () => {
  return {
    isLocal() {
      return hybridStorage.local
    }
  }
}

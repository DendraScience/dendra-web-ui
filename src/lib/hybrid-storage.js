class Storage {
  constructor() {
    this.local = true
    this.localStore = window.localStorage
    this.store = {}
  }

  getItem(key) {
    if (this.local) return this.localStore.getItem(key)
    return this.store[key]
  }

  setItem(key, value) {
    if (this.local) return this.localStore.setItem(key, value)
    return (this.store[key] = value)
  }

  removeItem(key) {
    if (this.local) this.localStore.removeItem(key)
    else delete this.store[key]
    return this
  }
}

const storage = new Storage()

export default storage

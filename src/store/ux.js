export const strict = false

export const state = () => ({
  downloadDrawer: undefined,
  mainDrawer: undefined,
  editing: false,
  editorColor: 'primary',
  editorDirty: 0,
  editorTitle: '',
  isLoading: false
})

export const actions = {}

export const getters = {}

export const mutations = {
  setDownloadDrawer(state, value) {
    state.downloadDrawer = value
  },
  toggleDownloadDrawer(state) {
    state.downloadDrawer = !state.downloadDrawer
  },

  setMainDrawer(state, value) {
    state.mainDrawer = value
  },
  toggleMainDrawer(state) {
    state.mainDrawer = !state.mainDrawer
  },

  setEditing(state, value) {
    state.editing = value
  },

  incEditorDirty(state) {
    state.editorDirty++
  },
  setEditorColor(state, value) {
    state.editorColor = value
  },
  setEditorDirty(state, value) {
    state.editorDirty = value
  },
  setEditorTitle(state, value) {
    state.editorTitle = value
  },
  setIsLoading(state, value) {
    state.isLoading = value
  }
}

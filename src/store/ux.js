export const strict = false

export const state = () => ({
  drawer: undefined,
  editing: false,
  editorColor: 'primary',
  editorDirty: 0,
  editorTitle: ''
})

export const actions = {}

export const getters = {}

export const mutations = {
  setDrawer(state, value) {
    state.drawer = value
  },
  toggleDrawer(state) {
    state.drawer = !state.drawer
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
  }
}

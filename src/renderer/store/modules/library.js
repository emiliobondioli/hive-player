const state = {
  tracks: [],
  loading: false
}

const mutations = {
  SET_TRACKS(state, data) {
    state.tracks = data
  },
  SET_LIBRARY(state, data) {
    state.tracks = data.tracks
  },
  SET_LOADING(state, data) {
    state.loading = data
  }
}

const actions = {
  setupListeners({ commit, dispatch }) {
    this._vm.$electron.ipcRenderer.on('library', (event, library) => {
      console.log('library received', library)
      commit('SET_LIBRARY', library)
      dispatch('player/playlist', library.tracks, {root:true})
    })
    this._vm.$electron.ipcRenderer.on('library:loading', (event, path) => {
      console.log('library scanning', path)
      commit('SET_LOADING', true)
    })
    this._vm.$electron.ipcRenderer.on('library:tracks', (event, tracks) => {
      commit('SET_TRACKS', tracks)
    })
    this._vm.$electron.ipcRenderer.send('library', (event, library) => {
      commit('SET_TRACKS', library)
    })
  }
}

export default {
  state,
  mutations,
  actions,
  namespaced: true,
}

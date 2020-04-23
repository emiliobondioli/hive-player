const state = {
    track: null,
    playing: false,
    progress: 0,
    playlist: []
}

const mutations = {
    SET_TRACK(state, data) {
        state.track = data
    },
    SET_PLAYLIST(state, data) {
        state.playlist = data
    },
    SET_PLAYING(state, data) {
        state.playing = data
    },
    SET_PROGRESS(state, data) {
        state.progress = data
    },
}

const actions = {
    load({ commit }, track) {
        commit('SET_TRACK', track)
    },
    playlist({ commit }, playlist) {
        commit('SET_PLAYLIST', playlist)
    },
    play({ commit }) {
        commit('SET_PLAYING', true)
    },
    pause({ commit }) {
        commit('SET_PLAYING', false)
    },
    next({ commit, state, getters }) {
        commit('SET_TRACK', state.playlist[getters.nextId])
    },
    prev({ commit, state, getters }) {
        commit('SET_TRACK', state.playlist[getters.prevId])
    }
}

const getters = {
    current: state => {
        return state.track
    },
    currentId: (state, getters) => {
        const t = state.playlist.find(t => t.id === getters.current.id)
        return state.playlist.indexOf(t)
    },
    nextId: (state, getters) => {
        const id = getters.currentId + 1
        if (id >= state.playlist.length) return 0
        return id
    },
    prevId: (state, getters) => {
        const id = getters.currentId - 1
        if (id < 0) return state.playlist.length - 1
        return id
    }
}

export default {
    state,
    mutations,
    actions,
    getters,
    namespaced: true,
}

// import AMap from 'AMap'

export const actions = {
  initWebsocket ({commit}, uri) {
    commit('initWebsocket', uri)
  },
  wsSend ({commit, state}, message) {
    console.log(state.testWebsocket)
    state.testWebsocket.send(message)
    commit('wsSend', message)
  }
}

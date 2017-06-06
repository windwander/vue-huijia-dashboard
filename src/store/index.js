import Vue from 'vue'
import Vuex from 'vuex'
import {getters} from './getters'
import {actions} from './actions'
import {state, mutations} from './mutations'
// 引入 axios
import axios from 'axios'

Vue.use(Vuex)

const store = new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  modules: {
    axios: axios
  }
})

if (module.hot) {
  // 使 actions 和 mutations 成为可热重载模块
  module.hot.accept([
    './getters',
    './actions',
    './mutations'
  ], () => {
    // 获取更新后的模块
    // 因为 babel 6 的模块编译格式问题，这里需要加上 .default
    // const newMutations = require('./mutations').default
    // const newModuleA = require('./modules/Amap').default
    // 加载新模块
    store.hotUpdate({
      getters: require('./getters'),
      actions: require('./actions'),
      mutations: require('./mutations'),
      // mutations: newMutations,
      modules: {
        // amap: newModuleA
      }
    })
  })
}

export default store

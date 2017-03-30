// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import MuseUI from 'muse-ui'
import 'muse-components/styles/base.less' // 加载基础的样式
// import 'muse-components/styles/themes/muse-ui.css'
import axios from 'axios'
import App from './App'
import store from './store'
import router from './router'
import 'muse-components/styles/themes/carbon.less'

// Vue.use(MuseUI)
Vue.config.productionTip = false
Vue.prototype.$ajax = axios // ajax使用axios
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})

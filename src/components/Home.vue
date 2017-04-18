<template>
<div class="home-div">
  <div id="amapContainer"></div>
  <Dashboard />
  <InfoWindow :infoData="infoWindowData" />
  <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="刷新页面" @actionClick="refresh()" @close="hideSnackbar()"/>
  <mu-popup position="top" :overlay="false" popupClass="popup-top" :open="topPopup">
    <p @click="closePopup()">{{recieveMsg}}</p>
  </mu-popup>
</div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import Dashboard from './Dashboard'
import InfoWindow from './InfoWindow'
import snackbar from 'muse-components/snackbar'
import popup from 'muse-components/popup'

Vue.component(snackbar.name, snackbar)
Vue.component(popup.name, popup)
export default {
  name: 'Home',
  components: {
    Dashboard,
    InfoWindow
  },
  data () {
    return {
      // wsUri: 'wss://echo.websocket.org',
      center: [118.722695, 32.033995],
      zoom: 12
    }
  },
  computed: {
    ...mapState([
      'infoWindowData',
      'snackbar',
      'snackbarTimer',
      'snackbarMsg',
      'recieveMsg',
      'topPopup'
    ])
  },
  mounted () {
    const z = this
    // 初始化地图
    z.$store.commit('initMap', {
      center: z.center,
      zoom: z.zoom
    })
    // // 设置初始标记点
    // z.$store.commit('doGeneratePoints')
    // // 初始化websocket
    // z.$store.dispatch('initWebsocket', z.wsUri)
  },
  methods: {
    ...mapMutations([
      'hideSnackbar',
      'closePopup'
    ]),
    updateMessage (e) {
      this.$store.commit('updateMessage', e.target.value)
    },
    refresh () {
      window.location.reload()
    }
  }
}
</script>

<style>
#app, .home-div, #amapContainer {
  width: 100%;
  height: 100%;
}
.marker-info {
  color: coral;
  font-size: 1em;
}
.marker-div {
  width: 48px;
  height: 48px;
  margin-top: -24px;
  line-height: 48px;
  color: #fff;
  text-align: center;
  text-shadow: #333 1px 1px 1px;
  background-repeat: no-repeat;
  background-position: center;
}
.order-normal {
  width: 28px;
  height: 28px;
  margin: 10px;
  border-radius: 14px;
  animation: ripple-blue 1s linear infinite;
}
.order-urgent {
  width: 28px;
  height: 28px;
  margin: 10px;
  border-radius: 14px;
  animation: ripple-red 1s linear infinite;
}
@keyframes ripple-blue {
  0% {
    box-shadow: 0 0 0 0 rgba(51, 133, 255, 0.1), 0 0 0 10px rgba(51, 133, 255, 0.1), 0 0 0 20px rgba(51, 133, 255, 0.1), 0 0 0 40px rgba(51, 133, 255, 0.1);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(51, 133, 255, 0.1), 0 0 0 20px rgba(51, 133, 255, 0.1), 0 0 0 40px rgba(51, 133, 255, 0.1), 0 0 0 60px rgba(51, 133, 255, 0);
  }
}
@keyframes ripple-red {
  0% {
    box-shadow: 0 0 0 0 rgba(240, 91, 72, 0.1), 0 0 0 10px rgba(240, 91, 72, 0.1), 0 0 0 20px rgba(240, 91, 72, 0.1), 0 0 0 40px rgba(240, 91, 72, 0.1);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(240, 91, 72, 0.1), 0 0 0 20px rgba(240, 91, 72, 0.1), 0 0 0 40px rgba(240, 91, 72, 0.1), 0 0 0 60px rgba(240, 91, 72, 0);
  }
}
.hide {
  display: none;
}
.icon-contaner {
  display: inline-block;
  vertical-align: middle;
  color: #ffeb3b;
  word-spacing: -4px;
  white-space: nowrap;
  overflow: hidden;
}
div.popup-top {
  padding: 0 2em;
  background-color: #f0f8ff;
  cursor: pointer;
}
</style>

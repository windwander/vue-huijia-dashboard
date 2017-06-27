<template>
<div class="map-home-div" :class="{'drawer-opened': openDrawer}">
  <MainMenu />
  <div id="amapContainer"></div>
  <MapDashboard :beforeLeave="beforeLeave" />
  <MapInfoWindow :infoData="infoWindowData" />
  <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar"/>
  <div v-if="isLoadingConfig" id="fullScreenLoading">
    <mu-circular-progress v-if="isLoadingConfig" :size="90" color="red" :strokeWidth="5" />
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import MapDashboard from './dashboard'
import MapInfoWindow from './infoWindow'
import MainMenu from '../units/mainMenu'
import snackbar from 'muse-components/snackbar'
import circularProgress from 'muse-components/circularProgress'

Vue.component(snackbar.name, snackbar)
Vue.component(circularProgress.name, circularProgress)

export default {
  name: 'MapHome',
  components: {
    MapDashboard,
    MapInfoWindow,
    MainMenu
  },
  data () {
    return {
      center: [118.722695, 32.033995],
      zoom: 12,
      beforeLeave: false
    }
  },
  computed: {
    ...mapState([
      'infoWindowData',
      'snackbar',
      'snackbarMsg',
      'isLoadingConfig',
      'openDrawer'
    ])
  },
  mounted () {
    const z = this
    // 初始化地图
    z.$store.commit('initMap', {
      center: z.center,
      zoom: z.zoom
    })
  },
  methods: {
    ...mapMutations([
      'hideSnackbar'
    ]),
    refresh () {
      window.location.reload()
    }
  },
  beforeRouteLeave: function (to, from, next) {
    this.beforeLeave = true
    setTimeout(function () {
      next()
    }, 0)
  }
}
</script>

<style>
.amap-toolbar {
  top: 80px !important;
}
#amapContainer .marker-info {
  color: coral;
  font-size: 1em;
}
#amapContainer .marker-div {
  width: 48px;
  height: 48px;
  line-height: 48px;
  color: #fff;
  text-align: center;
  text-shadow: #333 1px 1px 1px;
  background-repeat: no-repeat;
  background-position: center;
}
#amapContainer .order-normal {
  width: 28px;
  height: 28px;
  margin: 10px;
  border-radius: 14px;
  animation: ripple-blue 1s linear infinite;
}
#amapContainer .order-urgent {
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
</style>
<style scoped>
.map-home-div, #amapContainer {
  width: 100%;
  height: 100%;
}
#fullScreenLoading {
  z-index: 9999;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  color: #eee;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  align-self: center;
  justify-content: center;
}
</style>

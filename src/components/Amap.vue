<template>
  <div id="amapContainer"></div>
</template>

<script>
// import Vue from 'vue'
import AMap from 'AMap'

export default {
  name: 'Amap',
  data () {
    return {
      zoomLevel: 12,
      markers: [],
      amap: {},
      infoWindow: {},
      infoWindowData: {
        finished: 23,
        processing: 1,
        todo: 2,
        workerId: 1020,
        message: 'something to say 11'
      }
    }
  },
  mounted () {
    // console.log(this.$parent.wsUri)
  },
  methods: {
    // 初始化地图
    initMap: function (center, zoomLevel) {
      const amap = new AMap.Map('amapContainer', {
        resizeEnable: true,
        mapStyle: 'normal',
        zoom: zoomLevel,
        center: center
      })
      AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView'], function () {
        amap.addControl(new AMap.ToolBar())
        amap.addControl(new AMap.Scale())
        amap.addControl(new AMap.OverView({ isOpen: true }))
      })
      this.$emit('initMapa', amap)
    },
    // 设置标记点
    mapPoint: function (obj) {
    },
    removeMarkers: function () {
      this.amap.remove(this.markers)
      this.infoWindow.close()
    },
    setMarkers: function () {
      const current = this
      this.points.map(function (el) {
        current.mapPoint(el)
      })
    },
    resetView: function () {
      this.amap.setFitView(this.markers)
    },
    openInfoWindow: function (obj) {
      // 设置信息窗口
      let infoDiv = document.getElementById('infoWindowUI')
      this.infoWindow = new AMap.InfoWindow({
        // isCustom: true, // 自定义窗口样式
        content: infoDiv
      })
      this.infoWindow.open(this.amap, obj.center)
    }
  }
}
</script>

<style>
#amapContainer {
  width: 100vw;
  height: 100vh;
}
#infoWindowUI {
  z-index: 12;
}
.info-window-flex {
  text-align: center;
}
.marker-info {
  color: coral;
  font-size: 1em;
}
.marker-div {
  color: #fff;
  text-align: center;
  line-height: 3em;
  width: 3em;
  height: 3em;
  text-shadow: #333 1px 1px 1px;
}
.amap-info-content {
  width: 300px;
  height: 300px;
}
</style>

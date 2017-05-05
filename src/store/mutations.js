import AMap from 'AMap'

export const state = {
  amap: {},
  geocoder: {},
  workerDetail: {},
  infoWindowData: {},
  testWebsocket: {},
  snackbarMsg: '',
  snackbar: false,
  snackbarTimer: {},
  topPopup: false,
  recieveMsg: '',
  modalPopup: false,
  showOrderTable: false,
  cities: [],
  workers: [],
  orders: [],
  overallCount: {},
  workerTableHead: [],
  workerTableData: [],
  modalTableHead: [],
  modalTableData: [],
  errorLogin: {},
  todayOrdersPage: 1,
  todayOrdersPageSize: 10,
  todayOrdersTotal: 0,
  preSaveWorkerMonthList: {},
  bonusPenaltyFinished: false,
  settlementStatistic: []
}

export const mutations = {
  // 登录出错
  errorLogin (state, res) {
    state.errorLogin = res
  },
  // 初始化地图
  initMap (state, { center, zoom }) {
    state.amap = new AMap.Map('amapContainer', {
      resizeEnable: true,
      mapStyle: 'normal',
      zoom: zoom,
      center: center
    })
    // 地图插件
    AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView'], function () {
      state.amap.addControl(new AMap.ToolBar())
      state.amap.addControl(new AMap.Scale())
      // state.amap.addControl(new AMap.OverView({ isOpen: true }))
    })
    AMap.service('AMap.Geocoder', function () { // 回调函数
      // 实例化Geocoder
      state.geocoder = new AMap.Geocoder({
          // city: "010" // 城市，默认：“全国”
      })
    })
  },
  // 显示点标记
  mapPoint (state, obj) {
    mapPoint(obj)
  },
  // 移除点标记
  removeMarkers () {
    removeMarkers()
    // this.infoWindow.close()
  },
  // 自动适应窗口
  resetView () {
    state.amap.setFitView(state.points)
  },
  // 更新点标记窗口数据
  updateMessage (state, message) {
    state.infoWindowData.message = message
  },
  openInfoWindow (state, obj) {
    openInfoWindow(obj)
  },
  showSnackbar () {
    showSnackbar()
  },
  hideSnackbar () {
    hideSnackbar()
  },
  closePopup () {
    state.topPopup = false
  },
  showPopup (state, type) {
    state.modalPopup = true
    setTimeout(function () {
      const el = document.getElementsByClassName('modal-popup')[0]
      const marginBottom = (window.height - el.getBoundingClientRect().height) / 2
      if (marginBottom > 20) {
        el.style.marginBottom = marginBottom + 'px'
      } else {
        const table = el.children[1].children[0].children[0].children[1]
        table.style.overflowY = 'auto'
        table.style.maxHeight = 'calc(80vh - 120px)'
        el.style.marginBottom = '10vh'
      }
    }, 100)
  },
  hidePopup () {
    state.modalPopup = false
    state.todayOrdersTotal = 0
  },
  panBy (state, offset) {
    state.amap.panBy(offset.x, offset.y)
  },
  toggleOrderTable () {
    state.showOrderTable = !state.showOrderTable
  },
  changePage (state, newIndex) {
    state.todayOrdersPage = newIndex
  },
  hasDoneBonusPenalty (state, bool) {
    state.bonusPenaltyFinished = bool
  }
}
// 设置点标记
function mapPoint (obj) {
  let type = 'worker'
  let div = document.createElement('div')
  if (!obj.workerId) {
    type = 'order'
  }
  div.className = 'marker-div ' + type + '-' + obj.status
  div.style.backgroundImage = 'url("static/' + type + '-' + obj.status + '.png")'
  console.log([obj.lng || 118.722695, obj.lat || 32.033995])
  // div.innerHTML = obj.currentOrders || 0
  const point = new AMap.Marker({
    map: state.amap,
    position: [obj.lng || 118.722695, obj.lat || 32.033995],
    offset: new AMap.Pixel(-24, -24),
    // title: '美车师：' + obj.account, // 鼠标滑过显示
    content: div  // 自定义点标记覆盖物内容
  })
  point.on('click', function () {
    state.dispatch('getWorkerDetail')
  })
  // state.points.push(point)
}
// 移除点标记
function removeMarkers () {
  state.amap.clearMap()
  // state.amap.remove(state.points)
}
// 打开点标记窗口
function openInfoWindow (obj) {
  const status = ['空闲', '服务中', '已下线']
  const orderStatus = ['未超时', '已超时']
  function formatTimeString (time) {
    time = new Date(time)
    const month = time.getMonth() + 1
    const date = time.getDate()
    const hours = time.getHours() % 12 === 0 ? 12 : (time.getHours() > 12 ? '下午' + time.getHours() % 12 : '上午' + time.getHours())
    const minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
    return month + '月' + date + '日 ' + hours + ':' + minutes
  }
  state.infoWindowData = Object.assign({}, {
    type: !obj.carInfo ? 'worker' : 'order',
    account: obj.phone || obj.userPhone || '',
    name: obj.userName || obj.name || '',
    status: !obj.carInfo ? (status[obj.status] || status[0]) : (new Date() < obj.appointTime ? orderStatus[0] : orderStatus[1]),
    star: obj.score || '0',
    location: [obj.lng || obj.longitude || 118.722695, obj.lat || obj.latitude || 32.033995],
    address: obj.address || obj.location || '',
    currentOrders: obj.taskOverCount || 0,
    totalOrders: obj.orderCount || 0,
    todoOrders: obj.toBeAgentCount || 0,
    time: formatTimeString(obj.appointTime) || obj.appointTime || obj.timeRequire || '',
    orderId: obj.orderId || '',
    license: obj.carInfo || '',
    orderType: obj.productName || '',
    workerId: obj.workerId || ''
  })
  // 设置信息窗口
  const infoDiv = document.getElementById('infoWindowUI')
  infoDiv.style.display = 'block'
  const infoWindow = new AMap.InfoWindow({
    autoMove: true,
    content: infoDiv
  })
  infoWindow.open(state.amap, state.infoWindowData.location)
  AMap.event.addListener(infoWindow, 'close', function () {
    state.showOrderTable = false
  })
}
// 显示snackbar
function showSnackbar () {
  state.snackbar = true
  if (state.snackbarTimer) {
    clearTimeout(state.snackbarTimer)
  }
  state.snackbarTimer = setTimeout(() => { state.snackbar = false }, 2000)
}
function hideSnackbar () {
  state.snackbar = false
  if (state.snackbarTimer) {
    clearTimeout(state.snackbarTimer)
  }
}

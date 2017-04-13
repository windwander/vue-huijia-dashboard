import AMap from 'AMap'

export const state = {
  amap: {},
  geocoder: {},
  // points: [],
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
  workers: [],
  orders: [],
  overallCount: {
    // orderCount: 1,
    // busyWorkerCount: 2,
    // freeWorkerCount: 3,
    // toBeServiceCount: 4,
    // toBeAcceptCount: 5,
    // inServiceCount: 6,
    // payCount: 7,
    // cancelCount: 8,
    // inWorkerCount: 9,
    // outWorkerCount: 0
  },
  // orderTableHead: ['订单编号', '联系方式', '预约服务时间', '预约服务地点', '车牌', '预约服务类型'],
  // todayOrderList: [],
  // peopleTableHead: ['姓名', '联系方式', '所属小组'],
  // workerOrderList: [],
  // offlineWorkerList: [],
  tableHead: [],
  tableData: []
}

export const mutations = {
  // 初始化地图
  initMap (state, { center, zoom }) {
    state.amap = new AMap.Map('amapContainer', {
      resizeEnable: true,
      mapStyle: 'normal',
      zoom: zoom,
      center: center
    })
    // 地图插件
    // AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView'], function () {
    //   state.amap.addControl(new AMap.ToolBar())
    //   state.amap.addControl(new AMap.Scale())
    //   state.amap.addControl(new AMap.OverView({ isOpen: true }))
    // })
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
  // 生成随机点标记
  doGeneratePoints () {
    removeMarkers()
    for (let i = 0; i < 20; i++) {
      mapPoint(generatePoints())
    }
  },
  // 更新点标记窗口数据
  updateMessage (state, message) {
    state.infoWindowData.message = message
  },
  // websocket
  initWebsocket (state, uri) {
    state.testWebsocket = new WebSocket(uri)
    state.testWebsocket.onopen = function (evt) { wsOpen(evt) }
    state.testWebsocket.onclose = function (evt) { wsClose(evt) }
    state.testWebsocket.onmessage = function (evt) { wsMessage(evt) }
    state.testWebsocket.onerror = function (evt) { wsError(evt) }
  },
  wsSend (state, message) {
    state.snackbarMsg = 'websocket 发送：' + message
    showSnackbar()
  },
  openInfoWindow (state, obj) {
    openInfoWindow(obj)
  },
  hideSnackbar () {
    hideSnackbar()
  },
  closePopup () {
    state.topPopup = false
  },
  showPopup (state, type) {
    // if (type === 'order') {
    //   state.tableHead = state.orderTableHead
    //   state.tableData = state.todayOrderList
    // } else if (type === 'people') {
    //   state.tableHead = state.peopleTableHead
    //   state.tableData = state.offlineWorkerList
    // }
    state.modalPopup = true
    setTimeout(function () {
      const el = document.getElementsByClassName('modal-popup')[0]
      const marginBottom = (window.height - el.getBoundingClientRect().height) / 2
      if (marginBottom > 0) el.style.marginBottom = marginBottom + 'px'
      console.log(el.style.marginBottom)
    }, 100)
  },
  hidePopup () {
    state.modalPopup = false
  },
  panBy (state, offset) {
    console.log(offset.x)
    console.log(offset.y)
    state.amap.panBy(offset.x, offset.y)
  },
  toggleOrderTable () {
    state.showOrderTable = !state.showOrderTable
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
// 生成点标记数据
function generatePoints () {
  const type = getType()
  let point
  if (type === 'service') {
    point = {
      account: getMobile(),
      status: getStatus(),
      type: type,
      star: getStar(),
      location: getLocation(),
      totalOrders: Math.floor(Math.random() * 1000),
      currentOrders: Math.floor(Math.random() * 50),
      todoOrders: Math.floor(Math.random() * 20)
    }
  } else if (type === 'order') {
    point = {
      account: getMobile(),
      type: type,
      status: getOrderStatus(),
      location: getLocation(),
      time: new Date().toLocaleString(),
      orderId: 'W1702170012811',
      license: '苏A12883',
      orderType: '五座轿车清洗加内饰清洗'
    }
  }
  function getMobile () {
    const prefixArray = ['130', '131', '132', '133', '135', '137', '138', '170', '187', '189']
    const i = parseInt(10 * Math.random())
    let prefix = prefixArray[i]
    for (let j = 0; j < 8; j++) {
      prefix = prefix + Math.floor(Math.random() * 10)
    }
    return prefix
  }
  function getType () {
    const type = ['service', 'order']
    const i = Math.floor(Math.random() * type.length)
    return type[i]
  }
  function getStatus () {
    const status = ['busy', 'free', 'offline']
    const i = Math.floor(Math.random() * status.length)
    return status[i]
  }
  function getOrderStatus () {
    const orderType = ['normal', 'urgent']
    const i = Math.floor(Math.random() * orderType.length)
    return orderType[i]
  }
  function getStar () {
    return (Math.random() * 5).toFixed(1)
  }
  function getLocation () {
    const lat = (118.519191 + (Math.random() * (119.139918 - 118.519191))).toPrecision(6)
    const lon = (31.885132 + (Math.random() * (32.167470 - 31.885132))).toPrecision(6)
    let location = {
      lnglat: [0, 0],
      address: 'somewhere'
    }
    location.lnglat = [lat, lon]
    // 逆地理编码
    // const lnglat = [116.396574, 39.992706] // 地图上所标点的坐标
    state.geocoder.getAddress(location.lnglat, function (status, result) {
      if (status === 'complete' && result.info === 'OK') {
        // 获得了有效的地址信息:
        // 即，result.regeocode.formattedAddress
        console.log(result)
        location.address = result.regeocode.formattedAddress
      } else {
        // 获取地址失败
        location.address = '未知地址'
      }
    })
    return location
  }
  console.log(point)
  return point
}
// 打开点标记窗口
function openInfoWindow (obj) {
  console.log('hh------')
  console.log(obj)
  const status = ['空闲', '服务中', '已下线']
  const orderStatus = ['未超时', '已超时']
  state.infoWindowData = Object.assign({}, {
    type: !obj.carInfo ? 'worker' : 'order',
    account: obj.phone || obj.userPhone || '',
    name: obj.userName || obj.name || '',
    status: !obj.carInfo ? (status[obj.status] || status[0]) : (new Date() - obj.orderTime < 10 * 60 * 1000 ? orderStatus[0] : orderStatus[1]),
    star: obj.score || '0',
    location: [obj.lng || obj.longitude || 118.722695, obj.lat || obj.latitude || 32.033995],
    address: obj.address || obj.location || '',
    currentOrders: obj.taskOverCount || 0,
    totalOrders: obj.orderCount || 0,
    todoOrders: obj.toBeAgentCount || 0,
    time: obj.timeRequire || '',
    orderId: obj.orderId || '',
    license: obj.carInfo || '',
    orderType: obj.productName || ''
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
    console.log('close infowindow')
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
  console.log('show snackbar')
}
function hideSnackbar () {
  state.snackbar = false
  if (state.snackbarTimer) {
    clearTimeout(state.snackbarTimer)
  }
  console.log('hide snackbar')
}
// websocket 状态
function wsOpen (evt) {
  console.log(evt)
  state.snackbarMsg = 'websocket 打开'
  showSnackbar()
}
function wsClose (evt) {
  console.log(evt)
  state.snackbarMsg = 'websocket 关闭'
  showSnackbar()
}
function wsMessage (evt) {
  console.log(evt)
  state.recieveMsg = '收到 websocket 消息：' + evt.data
  state.topPopup = true
}
function wsError (evt) {
  console.log(evt)
  state.snackbarMsg = 'websocket 错误：' + evt.data
  showSnackbar()
}

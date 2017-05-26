import AMap from 'AMap'

export const state = {
  amap: {},
  geocoder: {},
  workerDetail: {},
  infoWindowData: {},
  points: [],
  point: {},
  snackbarMsg: '',
  snackbar: false,
  snackbarTimer: {},
  modalPopup: false,
  showModalTable: false,
  menus: [],
  cities: [],
  city: '320100',
  year: new Date().getFullYear().toString(),
  month: (function () {
    let dateMonth = new Date().getMonth() + 1
    dateMonth = dateMonth < 10 ? ('0' + dateMonth) : dateMonth.toString()
    return dateMonth
  })(),
  date: (function () {
    let dateDate = new Date().getDate()
    dateDate = dateDate < 10 ? ('0' + dateDate) : dateDate.toString()
    return dateDate
  })(),
  groups: [],
  group: '',
  isLoadingConfig: true,
  workers: [],
  orders: [],
  overallCount: {},
  workerTableHead: [],
  workerTableData: [],
  modalTableHead: [],
  modalTableData: [],
  errorLogin: {},
  pagination: {
    page: 0,
    size: 10,
    total: 0,
    totalPages: 0
  },
  searchResultList: [],
  todayOrdersPage: 1,
  todayOrdersPageSize: 10,
  todayOrdersTotal: 0,
  preSaveWorkerMonthList: {},
  bonusPenaltyFinished: false,
  settlementStatistic: [],
  generalOrderStatistics: [],
  operationTrendData: [],
  operationTrendCity: []
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
  // 清除视图的搜索结果
  clearSearchResult () {
    state.searchResultList = []
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
  showPopup (state) {
    state.modalPopup = true
    setTimeout(function () {
      const el = document.getElementsByClassName('modal-popup')[0]
      const marginBottom = (window.height - el.getBoundingClientRect().height) / 2
      if (marginBottom > 10) {
        el.style.marginBottom = marginBottom + 'px'
      } else {
        const table = el.children[1].children[0].children[0].children[1]
        table.style.overflowY = 'auto'
        table.style.maxHeight = 'calc(80vh - 120px)'
        el.style.marginBottom = '0'
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
  toggleModalTable () {
    state.showModalTable = !state.showModalTable
  },
  changePage (state, newIndex) {
    state.pagination.page = newIndex
  },
  hasDoneBonusPenalty (state, bool) {
    state.bonusPenaltyFinished = bool
  },
  setCity (state, cityCode) {
    state.city = cityCode
  },
  setGroup (state, leaderId) {
    state.group = leaderId
  },
  setYear (state, year) {
    state.year = year
  },
  setMonth (state, month) {
    state.month = month
  },
  setDate (state, date) {
    state.date = date
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
  state.points.push(point)
}
// 移除点标记
function removeMarkers () {
  // state.amap.clearMap()
  state.amap.remove(state.points)
}
// 打开点标记窗口
function openInfoWindow (obj) {
  function formatTimeString (time) {
    time = new Date(time)
    const month = time.getMonth() + 1
    const date = time.getDate()
    const hours = time.getHours() % 12 === 0 ? 12 : (time.getHours() > 12 ? '下午' + time.getHours() % 12 : '上午' + time.getHours())
    const minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
    return month + '月' + date + '日 ' + hours + ':' + minutes
  }
  function formatStatus (obj) {
    const status = ['空闲', '服务中', '已下线']
    const orderStatus = ['未超时', '已超时']
    let str = ''
    if (!obj.carInfo) {
      str = status[obj.status] || status[0]
    } else {
      if (obj.orderStatus === '10') {
        if (new Date() < obj.appointTime) {
          str = orderStatus[0]
        } else {
          str = orderStatus[1]
        }
      }
    }
    return str
  }
  state.infoWindowData = Object.assign({}, {
    type: !obj.carInfo ? 'worker' : 'order',
    account: obj.phone || obj.userPhone || '',
    name: obj.userName || obj.name || '',
    avatar: obj.icon ? ('http://image.huijiacn.com/' + obj.icon) : '',
    status: formatStatus(obj),
    star: obj.score || '0',
    location: [obj.lng || obj.longitude || 118.722695, obj.lat || obj.latitude || 32.033995],
    address: obj.address || obj.location || '',
    currentOrders: obj.taskOverCount || 0,
    totalOrders: obj.orderCount || 0,
    todoOrders: obj.toBeAgentCount || 0,
    toBePayCount: obj.toBePayCount || 0,
    inServiceCount: obj.inServiceCount || 0,
    cancleCount: obj.cancleCount || 0,
    targetNum: obj.targetNum || 0,
    totalNum: obj.totalNum || 0,
    orderCount: obj.orderCount || 0,
    completionRate: (obj.completionRate * 100) || 0,
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
    state.showModalTable = false
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

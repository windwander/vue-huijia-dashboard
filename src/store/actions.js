import AMap from 'AMap'
import axios from 'axios'
import router from '../router'

export const actions = {
  initWebsocket ({commit}, uri) {
    commit('initWebsocket', uri)
  },
  wsSend ({commit, state}, message) {
    console.log(state.testWebsocket)
    state.testWebsocket.send(message)
    commit('wsSend', message)
  },
  // 设置点标记
  mapPoint ({commit, dispatch, state}, obj) {
    let type = 'worker'
    let div = document.createElement('div')
    div.className = 'marker-div ' + type + '-' + obj.status
    div.style.backgroundImage = 'url("static/' + type + '-' + obj.status + '.png")'
    if (!obj.workerId) {
      type = 'order'
      let status = 'normal'
      if (new Date() - obj.orderTime > 10 * 60 * 1000) {
        status = 'urgent'
      }
      div.className = 'marker-div order-' + status
      div.style.backgroundImage = 'url("static/' + type + '-' + status + '.png")'
      div.dataset.orderId = obj.orderId
      div.dataset.orderPhone = obj.userPhone
    } else {
      div.dataset.workerId = obj.workerId
      div.dataset.workerPhone = obj.phone
    }
    console.log([obj.lng || obj.longitude || 118.722695, obj.lat || obj.latitude || 32.033995])
    // div.innerHTML = obj.currentOrders || 0
    const point = new AMap.Marker({
      map: state.amap,
      position: [obj.lng || obj.longitude || 118.722695, obj.lat || obj.latitude || 32.033995],
      offset: new AMap.Pixel(-24, -24),
      // title: '美车师：' + obj.account, // 鼠标滑过显示
      content: div  // 自定义点标记覆盖物内容
    })
    point.on('click', function () {
      console.log(!obj.carInfo)
      if (!obj.carInfo) {
        dispatch('getWorkerDetail', obj.workerId)
      } else {
        console.log('click')
        console.log(obj)
        commit('openInfoWindow', obj)
      }
    })
    state.points.push(point)
  },
  doLogin ({commit, state}, user) {
    axios.get('/api/v2/login?username=' + user.phone + '&password=' + user.password)
    .then(res => {
      console.log(res)
      if (res.data.code === '0000') { // 登录成功
        router.push('/')
      } else {
        commit('errorLogin', res.data)
      }
    })
    .catch(error => {
      console.error(error)
    })
  },
  /* 视图总情况查询
  CountVO {
    orderCount (integer, optional): 当日订单总数,
    busyWorkerCount (integer, optional): 忙碌人数,
    freeWorkerCount (integer, optional): 空闲人数,
    toBeServiceCount (integer, optional): 待服务订单数,
    toBeAcceptCount (integer, optional): 待接单订单数,
    inServiceCount (integer, optional): 服务中订单数,
    payCount (integer, optional): 已支付订单数,
    cancelCount (integer, optional): 取消订单数,
    inWorkerCount (integer, optional): 在线人数,
    outWorkerCount (integer, optional): 离线人数
  }
  */
  getOverallCount ({commit, state}) {
    axios.get('/api/v2/fworker/rest/v/Dashboard/count')
    .then(res => {
      console.log(res)
      state.overallCount = res.data
    })
    .catch(error => {
      console.error(error.toString())
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* 当日待接单和美车师当日待服务订单列表查询
  Order {
    userName (string, optional),
    workerName (string, optional),
    orderSource (string, optional),
    cityCode (string, optional),
    orderId (string, optional),
    orderStatus (string, optional),
    remark (string, optional),
    areaCode (string, optional),
    appointTime (date-time, optional),
    longitude (number, optional),
    latitude (number, optional),
    payStatus (string, optional),
    userPhone (string, optional),
    memo (string, optional),
    workerId (integer, optional),
    updateTime (date-time, optional),
    payAmount (integer, optional),
    productId (integer, optional),
    suggest (string, optional),
    preWorkId (integer, optional),
    orderTime (date-time, optional),
    payTime (date-time, optional),
    carInfo (string, optional),
    parkingNo (string, optional),
    timeRequire (string, optional),
    saleAmount (integer, optional),
    deductionAmount (integer, optional),
    realPayAmount (integer, optional),
    cancelReason (string, optional),
    isOrderFor (boolean, optional),
    deleted (boolean, optional),
    catalogJson (string, optional),
    userId (integer, optional),
    productName (string, optional),
    location (string, optional)
  }
  */
  getOrderList ({commit, state}, data) {
    let workerIdString = ''
    if (data.orderStatus === '20') {
      workerIdString = '&workerId=' + data.workerId
    }
    axios.get('/api/v2/fworker/rest/v/Dashboard/orderList?orderStatus=' + data.orderStatus + workerIdString)
    .then(res => {
      // 订单状态 当日待接单订单-10 美车师待服务订单-20
      console.log(res)
      if (data.orderStatus === '10') {
        state.tableHead = ['订单编号', '联系方式', '预约服务时间', '预约服务地点', '车牌', '预约服务类型']
        state.tableData = res.data.map(o => {
          const order = {
            'orderId': o.orderId,
            'userPhone': o.userPhone,
            'timeRequire': o.timeRequire,
            'location': o.location,
            'carInfo': o.carInfo,
            'productName': o.productName
          }
          return order
        })
        commit('showPopup', 'order')
      } else if (data.orderStatus === '20') {
        state.workerOrderList = res.data
        state.tableHead = ['订单编号', '联系方式', '预约服务时间', '预约服务地点', '车牌', '预约服务类型']
        state.tableData = res.data.map(o => {
          const order = {
            'orderId': o.orderId,
            'userPhone': o.userPhone,
            'timeRequire': o.timeRequire,
            'location': o.location,
            'carInfo': o.carInfo,
            'productName': o.productName
          }
          return order
        })
        commit('toggleOrderTable')
        if (state.showOrderTable) {
          setTimeout(function () {
            const offset = window.innerWidth - document.getElementsByClassName('order-table')[0].getBoundingClientRect().right
            if (offset < 0) {
              commit('panBy', {
                x: offset - 20,
                y: 0
              })
            }
          }, 100)
        }
      }
    })
    .catch(error => {
      console.error(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* 订单查询
  Order {
    userName (string, optional),
    workerName (string, optional),
    orderSource (string, optional),
    cityCode (string, optional),
    orderId (string, optional),
    orderStatus (string, optional),
    remark (string, optional),
    areaCode (string, optional),
    appointTime (date-time, optional),
    longitude (number, optional),
    latitude (number, optional),
    payStatus (string, optional),
    userPhone (string, optional),
    memo (string, optional),
    workerId (integer, optional),
    updateTime (date-time, optional),
    payAmount (integer, optional),
    productId (integer, optional),
    suggest (string, optional),
    preWorkId (integer, optional),
    orderTime (date-time, optional),
    payTime (date-time, optional),
    carInfo (string, optional),
    parkingNo (string, optional),
    timeRequire (string, optional),
    saleAmount (integer, optional),
    deductionAmount (integer, optional),
    realPayAmount (integer, optional),
    cancelReason (string, optional),
    isOrderFor (boolean, optional),
    deleted (boolean, optional),
    catalogJson (string, optional),
    userId (integer, optional),
    productName (string, optional),
    location (string, optional)
  }
  */
  getOrders ({dispatch, state}) {
    axios.get('/api/v2/fworker/rest/v/Dashboard/orders')
    .then(res => {
      console.log(res)
      state.orders = res.data
      state.orders.map(o => dispatch('mapPoint', o))
    })
    .catch(error => {
      console.error(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* 离线美车师详情查询
  WorkerDashboardVO {
    phone (string, optional): 电话,
    score (number, optional): 星级,
    workerId (integer, optional),
    lng (string, optional): 经度,
    lat (string, optional): 纬度,
    orderCount (integer, optional): 当天总订单数,
    taskOverCount (integer, optional): 当日完成订单数,
    toBeAgentCount (integer, optional): 当日待服务数,
    icon (string, optional): 头像,
    status (string, optional): 状态,
    address (string, optional): 服务地址,
    name (string, optional): 名字
  }
  */
  getWorkerDetail ({commit, state}, workerId) {
    axios.get('/api/v2/fworker/rest/v/Dashboard/workerDetial?workerId=' + workerId)
    .then(res => {
      console.log(res)
      state.workerDetail = res.data
      console.log(state.workerDetail)
      commit('openInfoWindow', state.workerDetail)
    })
    .catch(error => {
      console.error(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* 离线美车师列表查询
  WcwWorker {
    cityCode (string, optional),
    phone (string, optional),
    workerId (integer, optional),
    workerCode (string, optional),
    idCard (string, optional),
    applyTime (date-time, optional),
    checkTime (date-time, optional),
    referrerCode (string, optional),
    gender (string, optional),
    provinceCode (string, optional),
    districtCode (string, optional),
    parentId (integer, optional),
    rootId (integer, optional),
    rootPath (string, optional),
    workPhone (string, optional),
    userId (integer, optional),
    level (integer, optional),
    icon (string, optional),
    status (string, optional),
    serviceStatus (integer, optional),
    name (string, optional)
  }
  */
  getWorkerList ({commit, state}) {
    axios.get('/api/v2/fworker/rest/v/Dashboard/workerList')
    .then(res => {
      console.log(res)
      state.tableHead = ['姓名', '联系方式', '所属小组']
      state.tableData = res.data.map(p => {
        const people = {
          'name': p.name,
          'phone': p.phone,
          'parentName': p.parentName
        }
        return people
      })
      commit('showPopup', 'people')
    })
    .catch(error => {
      console.error(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* 美车师查询
  WorkerDashboardVO {
    phone (string, optional): 电话,
    score (number, optional): 星级,
    workerId (integer, optional),
    lng (string, optional): 经度,
    lat (string, optional): 纬度,
    orderCount (integer, optional): 当天总订单数,
    taskOverCount (integer, optional): 当日完成订单数,
    toBeAgentCount (integer, optional): 当日待服务数,
    icon (string, optional): 头像,
    status (string, optional): 状态,
    address (string, optional): 服务地址,
    name (string, optional): 名字
  }
  */
  getWorkers ({dispatch, state}) {
    axios.get('/api/v2/fworker/rest/v/Dashboard/workers')
    .then(res => {
      console.log(res)
      state.workers = res.data
      state.workers.map(w => dispatch('mapPoint', w))
    })
    .catch(error => {
      console.error(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* 搜索栏查询
  SearchVO {
    order (Order, optional),
    workerDashboardVO (WorkerDashboardVO, optional)
  }
  Order {
    userName (string, optional),
    userId (integer, optional),
    orderSource (string, optional),
    cityCode (string, optional),
    orderId (string, optional),
    orderStatus (string, optional),
    remark (string, optional),
    areaCode (string, optional),
    appointTime (date-time, optional),
    longitude (number, optional),
    latitude (number, optional),
    payStatus (string, optional),
    memo (string, optional),
    userPhone (string, optional),
    isOrderFor (boolean, optional),
    workerName (string, optional),
    workerId (integer, optional),
    updateTime (date-time, optional),
    payAmount (integer, optional),
    productId (integer, optional),
    suggest (string, optional),
    preWorkId (integer, optional),
    orderTime (date-time, optional),
    payTime (date-time, optional),
    carInfo (string, optional),
    parkingNo (string, optional),
    timeRequire (string, optional),
    saleAmount (integer, optional),
    deductionAmount (integer, optional),
    realPayAmount (integer, optional),
    cancelReason (string, optional),
    deleted (boolean, optional),
    catalogJson (string, optional),
    productName (string, optional),
    location (string, optional)
  }
  WorkerDashboardVO {
    phone (string, optional): 电话,
    score (number, optional): 星级,
    workerId (integer, optional),
    lng (number, optional): 经度,
    lat (number, optional): 纬度,
    orderCount (integer, optional): 当天总订单数,
    taskOverCount (integer, optional): 当日完成订单数,
    toBeAgentCount (integer, optional): 当日待服务数,
    icon (string, optional): 头像,
    status (integer, optional): 状态 0-空闲 1-服务中 2-已下线,
    address (string, optional): 服务地址,
    name (string, optional): 名字
  }
  */
  doSearch ({commit, dispatch, state}, data) {
    let searchString = ''
    if (data.type === 'phone') {
      searchString = 'phone=' + data.input
    } else if (data.type === 'order') {
      searchString = 'orderId=' + data.input
    }
    axios.get('/api/v2/fworker/rest/v/Dashboard/search?' + searchString)
    .then(res => {
      const result = res.data
      if (result.order) {
        commit('openInfoWindow', result.order)
      } else if (result.workerDashboardVO) {
        dispatch('getWorkerDetail', result.workerDashboardVO.workerId)
      }
    })
    .catch(error => {
      console.error(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* PUT /v/Dashboard/send
    派单
  */
  sendOrder ({state}, data) {
    axios.put('/api/v2/fworker/rest/v/Dashboard/send?orderId=' + data.orderId + '&workerId=' + data.workerId)
    .then(res => {
      console.log(res)
      router.push('/')
    })
    .catch(error => {
      console.error(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  }
}

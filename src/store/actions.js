import AMap from 'AMap'
import axios from 'axios'
import router from '../router'

export const actions = {
  /*
    设置点标记
  */
  mapPoint ({commit, dispatch, state}, obj) {
    let type = 'worker'
    let div = document.createElement('div')
    div.className = 'marker-div ' + type + '-' + obj.status
    div.style.backgroundImage = 'url("static/' + type + '-' + obj.status + '.png")'
    if (!obj.workerId) { // 订单
      type = 'order'
      let status = 'normal'
      if (new Date() > obj.appointTime) {
        status = 'urgent'
      }
      div.className = 'marker-div order-' + status
      div.style.backgroundImage = 'url("static/' + type + '-' + status + '.png")'
      div.dataset.orderId = obj.orderId
      div.dataset.orderPhone = obj.userPhone
    } else { // 美车师
      div.dataset.workerId = obj.workerId
      div.dataset.workerPhone = obj.phone
    }
    const point = new AMap.Marker({
      map: state.amap,
      position: [obj.lng || obj.longitude || 118.722695, obj.lat || obj.latitude || 32.033995],
      offset: new AMap.Pixel(-24, -24),
      // title: '美车师：' + obj.account, // 鼠标滑过显示
      content: div  // 自定义点标记覆盖物内容
    })
    point.on('click', function () {
      if (!obj.carInfo) { // 美车师
        dispatch('getWorkerDetail', obj.workerId)
      } else { // 订单
        commit('openInfoWindow', obj)
      }
    })
  },
  /*
    用户登录
  */
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
      console.dir(error)
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
    let queryString = ''
    if (data.orderStatus) {
      if (data.orderStatus === '10') {
        queryString = 'orderList?orderStatus=10'
      } else if (data.orderStatus === '20') {
        queryString = 'orderList?orderStatus=20&workerId=' + data.workerId
      }
    } else if (data.orderStatus === '') {
      let page = data.page || 0
      let size = data.size || 10
      queryString = 'ordersPage?page=' + page + '&size=' + size + '&sort=APPOINT_TIME,desc'
    }
    axios.get('/api/v2/fworker/rest/v/Dashboard/' + queryString)
    .then(res => {
      // 订单状态 当日待接单订单-10 美车师待服务订单-20
      console.log(res)
      function formatTimeString (time) {
        time = new Date(time)
        const month = time.getMonth() + 1
        const date = time.getDate()
        const hours = time.getHours() % 12 === 0 ? 12 : time.getHours() > 12 ? '下午' + time.getHours() % 12 : '上午' + time.getHours()
        const minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
        return month + '月' + date + '日 ' + hours + ':' + minutes
      }
      if (data.orderStatus === '10') {
        state.modalTableHead = ['订单编号', '联系方式', '预约服务时间', '预约服务地点', '车牌', '预约服务类型']
        state.modalTableData = res.data.map(o => {
          const order = {
            'orderId': o.orderId,
            'userPhone': o.userPhone,
            'appointTime': formatTimeString(o.appointTime),
            'location': o.location,
            'carInfo': o.carInfo,
            'productName': o.productName
          }
          return order
        })
        commit('showPopup', 'order')
      } else if (data.orderStatus === '20') {
        state.workerOrderList = res.data
        state.modalTableHead = ['订单编号', '联系方式', '预约服务时间', '预约服务地点', '车牌', '预约服务类型']
        state.modalTableData = res.data.map(o => {
          const order = {
            'orderId': o.orderId,
            'userPhone': o.userPhone,
            'appointTime': formatTimeString(o.appointTime),
            'location': o.location,
            'carInfo': o.carInfo,
            'productName': o.productName
          }
          return order
        })
        commit('toggleModalTable')
        if (state.showModalTable) {
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
      } else if (data.orderStatus === '') {
        state.modalTableHead = ['订单编号', '联系方式', '预约服务时间', '预约服务地点', '车牌', '预约服务类型']
        state.modalTableData = res.data.content.map(o => {
          const order = {
            'orderId': o.orderId,
            'userPhone': o.userPhone,
            'appointTime': formatTimeString(o.appointTime),
            'location': o.location,
            'carInfo': o.carInfo,
            'productName': o.productName
          }
          return order
        })
        state.todayOrdersTotal = res.data.totalElements
        commit('showPopup', 'order')
      }
    })
    .catch(error => {
      console.dir(error)
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
      console.dir(error)
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
      console.dir(error)
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
      state.modalTableHead = ['姓名', '联系方式', '所属小组']
      state.modalTableData = res.data.map(p => {
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
      console.dir(error)
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
      console.dir(error)
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
      console.dir(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* PUT /v/Dashboard/send
    派单
  */
  sendOrder ({commit, state}, data) {
    axios.put('/api/v2/fworker/rest/v/Dashboard/send?orderId=' + data.orderId + '&workerId=' + data.workerId)
    .then(res => {
      console.log(res)
      state.snackbarMsg = '派单成功'
      commit('showSnackbar')
      // router.push('/')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '派单失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /*
    POST 获取美车师结算设置列表
    /fworker/rest/a/getPreSaveWorkerMonthList?workMonth=2017-04&cityCode=320100
  */
  getPreSaveWorkerMonthList ({commit, state}, data) {
    axios.post('/api/v2/fworker/rest/a/getPreSaveWorkerMonthList?workMonth=' + data.workMonth + '&cityCode=' + data.cityCode)
    .then(res => {
      console.log(res)
      state.preSaveWorkerMonthList = res.data
      state.workerTableHead = ['#', '姓名', '美车师账号', '上岗时间', '职务', '本月工作天数', '伯乐奖', '培训补贴天数', '延迟履约', '投诉追责', '费用骗取', '培训费用', '延迟接单', '服务不规范', '转单延迟1', '转单延迟2', '操作']
      state.workerTableData = res.data.map((w, index) => {
        const worker = {
          'workerId': w.workerId,
          'index': index + 1,
          'workerName': w.workerName,
          'phone': w.phone,
          'startDate': w.startDate,
          'position': w.position,
          'workDays': w.workDays,
          'pearlWards': w.pearlWards,
          'trainAllowance': w.trainAllowance,
          'delayAgreement': w.delayAgreement,
          'complaint': w.complaint,
          'cheat': w.cheat,
          'train': w.train,
          'delayTake': w.delayTake,
          'nonstandard': w.nonstandard,
          'delayTurnFrom': w.delayTurnFrom,
          'delayTurnTo': w.delayTurnTo
        }
        return worker
      })
      // router.push('/')
    })
    .catch(error => {
      console.dir(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* POST /a/preSaveWorkerMonth
    美车师奖惩结算预保存
  */
  preSaveWorkerMonth ({commit, state}, data) {
    axios.post('/api/v2/fworker/rest/a/preSaveWorkerMonth', data)
    .then(res => {
      console.log(res)
      state.snackbarMsg = '保存成功'
      commit('showSnackbar')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '保存失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* POST /a/doAddBonusPenalty
    美车师结算入库
   */
  doAddBonusPenalty ({commit, state}, data) {
    axios.post('/api/v2/fworker/rest/a/doAddBonusPenalty?workMonth=' + data.workMonth + '&cityCode=' + data.cityCode)
    .then(res => {
      console.log(res)
      state.snackbarMsg = '结算入库成功'
      commit('showSnackbar')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = (error.response.data && error.response.data.message) || '结算入库失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /a/exportWorkMonth
    导出奖惩月结算预存信息
  */
  exportWorkMonth ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/exportWorkMonth?workMonth=' + data.workMonth + '&cityCode=' + data.cityCode, {
      responseType: 'blob'
    })
    .then(res => {
      console.log(res)
      const filename = '美车师结算项设置(' + data.workMonth + ')'
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename)
      } else {
        const blobURL = window.URL.createObjectURL(blob)
        let tempLink = document.createElement('a')
        tempLink.href = blobURL
        tempLink.setAttribute('download', filename)
        tempLink.setAttribute('target', '_blank')
        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
      }
      state.snackbarMsg = '导出成功'
      commit('showSnackbar')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '导出失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* POST /a/hasDoneBonusPenalty
    是否已完成当月奖惩结算
   */
  hasDoneBonusPenalty ({commit, state}, data) {
    axios.post('/api/v2/fworker/rest/a/hasDoneBonusPenalty?workMonth=' + data.workMonth + '&cityCode=' + data.cityCode)
    .then(res => {
      console.log(res)
      commit('hasDoneBonusPenalty', res.data)
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = (error.response.data && error.response.data.message) || '获取当月奖惩结算完成状态失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /a/getWorkerBonusPenaltyByMonth
    获取美车师当月奖惩
   */
  getWorkerBonusPenaltyByMonth ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/getWorkerBonusPenaltyByMonth?workMonth=' + data.workMonth + '&workerId=' + data.workerId)
    .then(res => {
      console.log(res)
      console.table(res.data)
      state.modalTableHead = ['结算项名称', '数量', '单次金额', '总金额']
      let sumCost = 0
      state.modalTableData = res.data.map(p => {
        sumCost += p.totalCost
        const people = {
          'description': p.description,
          'num': p.num,
          'unitCost': p.unitCost,
          'totalCost': p.totalCost
        }
        return people
      })
      state.modalTableData.push({
        'description': '总计',
        'num': '',
        'unitCost': '',
        'totalCost': sumCost
      })
      commit('showPopup', 'people')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = (error.response.data && error.response.data.message) || '获取美车师当月奖惩失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /a/exportBonusPenalty
    导出指定美车师奖惩月结算信息
  */
  exportBonusPenalty ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/exportBonusPenalty?workerId=' + data.workerId + '&workMonth=' + data.workMonth + '&cityCode=' + data.cityCode, {
      responseType: 'blob'
    })
    .then(res => {
      console.log(res)
      const filename = data.workerName + '美车师月结算信息(' + data.workMonth + ')'
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename)
      } else {
        const blobURL = window.URL.createObjectURL(blob)
        let tempLink = document.createElement('a')
        tempLink.href = blobURL
        tempLink.setAttribute('download', filename)
        tempLink.setAttribute('target', '_blank')
        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
      }
      state.snackbarMsg = '导出成功'
      commit('showSnackbar')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '导出失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /a/cities
    城市列表查询
   */
  getCities ({commit, state}, data) {
    axios.get('/api/v2/fuser/rest/a/cities')
    .then(res => {
      console.log(res)
      state.cities = res.data
    })
    .catch(error => {
      console.dir(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /rest/a/getSettlementStatistic
    查询结算汇总信息接口
   */
  getSettlementStatistic ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/getSettlementStatistic?cityCode=' + data.cityCode + '&month=' + data.month)
    .then(res => {
      console.log(res)
      state.settlementStatistic = res.data.map((w) => {
        const worker = {
          'workerId': w.workerId,
          'workerName': w.workerName,
          'orderFee': w.orderFee,
          'orderNum': w.orderNum,
          'reward': w.reward,
          'productFee': w.productFee,
          'serviceFee': w.serviceFee,
          'workerServiceFee': w.workerServiceFee,
          'workerBonusPenalty': w.workerBonusPenalty,
          'workerTotal': w.workerTotal,
          'cityProductFee': w.cityProductFee,
          'cityServiceFee': w.cityServiceFee,
          'cityBonusPenalty': w.cityBonusPenalty,
          'cityPlatformFee': w.cityPlatformFee,
          'cityTotal': w.cityTotal,
          'platformFee': w.platformFee,
          'platformTotal': w.platformTotal
        }
        return worker
      })
    })
    .catch(error => {
      console.dir(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /rest/a/downSettlementStatistic
    导出结算汇总信息接口
   */
  downSettlementStatistic ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/downSettlementStatistic?cityCode=' + data.cityCode + '&month=' + data.month, {
      responseType: 'blob'
    })
    .then(res => {
      console.log(res)
      const filename = '美车师结算汇总(' + data.month + ')'
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename)
      } else {
        const blobURL = window.URL.createObjectURL(blob)
        let tempLink = document.createElement('a')
        tempLink.href = blobURL
        tempLink.setAttribute('download', filename)
        tempLink.setAttribute('target', '_blank')
        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
      }
      state.snackbarMsg = '导出成功'
      commit('showSnackbar')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '导出失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /rest/a/getSettlementByWorker
    查询美车师结算接口
   */
  getSettlementByWorker ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/getSettlementByWorker?workerId=' + data.workerId + '&month=' + data.month)
    .then(res => {
      console.log(res)
      state.modalTableHead = ['服务种类', '订单费', '产品费', '服务费用', '美车师结算\n服务费提成', '美车师结算\n奖惩', '美车师结算\n合计', '城市结算\n产品费', '城市结算\n服务费提成', '城市结算\n奖惩', '城市结算\n平台费', '城市结算\n合计', '平台结算\n平台费', '平台结算\n合计']
      state.modalTableData = res.data.settlements && res.data.settlements.map(p => {
        const people = {
          'productName': p.productName,
          'orderFee': p.orderFee,
          'productFee': p.productFee,
          'serviceFee': p.serviceFee,
          'workerServiceFee': p.workerServiceFee,
          'workerBonusPenalty': p.workerBonusPenalty,
          'workerTotal': p.workerTotal,
          'cityProductFee': p.cityProductFee,
          'cityServiceFee': p.cityServiceFee,
          'cityBonusPenalty': p.cityBonusPenalty,
          'cityPlatformFee': p.cityPlatformFee,
          'cityTotal': p.cityTotal,
          'platformFee': p.platformFee,
          'platformTotal': p.platformTotal
        }
        return people
      })
      const last = state.modalTableData[state.modalTableData.length - 1]
      console.table(state.modalTableData)
      last.workerBonusPenalty = res.data.workerBonusPenalty
      last.workerTotal = res.data.workerTotal
      last.cityBonusPenalty = res.data.cityBonusPenalty
      last.cityTotal = res.data.cityTotal
      commit('showPopup', 'people')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '查看失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /rest/a/downSettlementByWorker
    导出美车师结算接口
   */
  downSettlementByWorker ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/downSettlementByWorker?workerId=' + data.workerId + '&month=' + data.month, {
      responseType: 'blob'
    })
    .then(res => {
      console.log(res)
      const filename = data.workerName + '美车师结算(' + data.month + ')'
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename)
      } else {
        const blobURL = window.URL.createObjectURL(blob)
        let tempLink = document.createElement('a')
        tempLink.href = blobURL
        tempLink.setAttribute('download', filename)
        tempLink.setAttribute('target', '_blank')
        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
      }
      state.snackbarMsg = '导出成功'
      commit('showSnackbar')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '导出失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /rest/a/solveSettleProblem
    美车师结算问题修复接口
   */
  solveSettleProblem ({commit, state}, data) {
    state.snackbarMsg = '正在执行修复，请稍后……'
    commit('showSnackbar')
    axios.get('/api/v2/fworker/rest/a/solveSettleProblem?month=' + data.month)
    .then(res => {
      console.log(res)
      state.snackbarMsg = '执行修复成功'
      commit('showSnackbar')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '执行修复失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  }
}

import AMap from 'AMap'
import axios from 'axios'
import router from '../router'

export const actions = {
  /* 设置点标记 */
  mapPoint ({commit, dispatch, state}, obj) {
    let type = 'worker'
    let div = document.createElement('div')
    div.className = 'marker-div ' + type + '-' + obj.status + (obj.breakStatus === 0 ? '-lost' : '')
    div.style.backgroundImage = 'url("static/' + type + '-' + obj.status + (obj.breakStatus === 0 ? '-lost' : '') + '.png")'
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
      title: (obj.userName || obj.name) + '：' + (obj.phone || obj.userPhone), // 鼠标滑过显示
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
  /* 用户登录 */
  doLogin ({dispatch, commit, state}, user) {
    axios.get('/api/v2/login?username=' + user.phone + '&password=' + user.password)
    .then(res => {
      if (res.data.code === '0000') { // 登录成功
        router.push('/')
      } else {
        commit('errorLogin', res.data)
      }
    })
    .catch(error => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        commit('errorLogin', error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
        commit('errorLogin', error.message)
      }
    })
  },
  /* GET /v/NewDashboard/config 配置权限查询 */
  getConfig ({commit, state}) {
    axios.get('/api/v2/fworker/rest/v/NewDashboard/config')
    .then(res => {
      state.cities = res.data.citys
      state.groups = res.data.leaders
      state.isLoadingConfig = false
    })
    .catch(error => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        state.snackbarMsg = '配置权限查询：' + (error.response.data && error.response.data.message) || '回应失败'
        commit('showSnackbar')
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
        state.snackbarMsg = '配置权限查询：请求失败'
        commit('showSnackbar')
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
        state.snackbarMsg = '配置权限查询：' + error.message
        commit('showSnackbar')
      }
      state.isLoadingConfig = false
    })
  },
  /* GET /v/NewDashboard/menu 菜单权限查询 */
  getMenu ({commit, state}) {
    axios.get('/api/v2/fworker/rest/v/NewDashboard/menu')
    .then(res => {
      state.menus = res.data
    })
    .catch(error => {
      router.push('login')
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
      }
    })
  },
  /* GET /v/NewDashboard/count 视图总情况查询 */
  getOverallCount ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/v/NewDashboard/count?cityCode=' + data.cityCode + '&leaderId=' + data.leaderId)
    .then(res => {
      state.overallCount = res.data
    })
    .catch(error => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        state.snackbarMsg = '视图总情况查询：' + (error.response.data && error.response.data.message) || '回应失败'
        commit('showSnackbar')
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
        state.snackbarMsg = '视图总情况查询：请求失败'
        commit('showSnackbar')
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
        state.snackbarMsg = '视图总情况查询：' + error.message
        commit('showSnackbar')
      }
    })
  },
  /* GET /v/NewDashboard/orderList 当日所有类型和美车师当日待服务订单列表查询查询 */
  // 订单状态 待接单:10，待服务：20，服务中：30，待付款：40，已支付：50，60，已取消：90，全部：20,30,40,50,60,90，美车师待服务订单:20
  getOrderList ({commit, state}, data) {
    let queryString = 'orderList?cityCode=' + data.cityCode + '&leaderId=' + data.leaderId + '&status=' + data.status + '&page=' + data.page + '&size=' + data.size
    if (data.sort) {
      queryString += '&sort=' + data.sort
    } else {
      queryString += '&sort=APPOINT_TIME,desc'
    }
    axios.get('/api/v2/fworker/rest/v/NewDashboard/' + queryString)
    .then(res => {
      state.pagination.page = res.data.number
      state.pagination.size = res.data.size
      state.pagination.total = res.data.totalElements
      state.pagination.totalPages = res.data.totalPages
      function formatTimeString (time) {
        time = new Date(time)
        const month = time.getMonth() + 1
        const date = time.getDate()
        const hours = time.getHours() % 12 === 0 ? 12 : time.getHours() > 12 ? '下午' + time.getHours() % 12 : '上午' + time.getHours()
        const minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
        return month + '月' + date + '日 ' + hours + ':' + minutes
      }
      function formatOrderStatus (status) {
        let str = ''
        switch (status) {
          case '10':
            str = '待接单'
            break
          case '20':
            str = '待服务'
            break
          case '30':
            str = '服务中'
            break
          case '40':
            str = '待付款'
            break
          case '50':
          case '60':
            str = '已支付'
            break
          case '90':
            str = '已取消'
            break
          default:
            str = ''
        }
        return str
      }
      state.modalTableHead = ['订单编号', '联系方式', '预约服务时间', '预约服务地点', '车牌', '预约服务类型', '完成时间', '订单状态', '备注']
      state.modalTableData = res.data.content.map(o => {
        const order = {
          'orderId': o.orderId,
          'userPhone': o.userPhone,
          'appointTime': formatTimeString(o.appointTime),
          'location': o.location,
          'carInfo': o.carInfo,
          'productName': o.productName,
          'completeTime': o.completeTime,
          'orderStatus': formatOrderStatus(o.orderStatus),
          'remark': o.remark
        }
        return order
      })
      commit('showPopup')
    })
    .catch(error => {
      console.dir(error)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        state.snackbarMsg = '订单列表查询：' + (error.response.data && error.response.data.message) || '回应失败'
        commit('showSnackbar')
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
        state.snackbarMsg = '订单列表查询：请求失败'
        commit('showSnackbar')
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
        state.snackbarMsg = '订单列表查询：' + error.message
        commit('showSnackbar')
      }
    })
  },
  /* GET /v/NewDashboard/workerList 美车师列表查询 */
  // 查询类型1：在线 2：离线 3：忙碌 4：空闲
  getWorkerList ({commit, state}, data) {
    let queryString = 'workerList?cityCode=' + data.cityCode + '&leaderId=' + data.leaderId + '&searchType=' + data.status + '&page=' + data.page + '&size=' + data.size
    if (data.sort) {
      queryString += '&sort=' + data.sort
    } else {
      queryString += '&sort=APPOINT_TIME,desc'
    }
    axios.get('/api/v2/fworker/rest/v/NewDashboard/' + queryString)
    .then(res => {
      state.pagination.page = res.data.number
      state.pagination.size = res.data.size
      state.pagination.total = res.data.totalElements
      state.pagination.totalPages = res.data.totalPages
      state.modalTableHead = ['姓名', '联系方式', '所属小组', '当月已完成', '当月目标', '当月完成率']
      state.modalTableData = res.data.content.map(p => {
        const people = {
          'name': p.name,
          'phone': p.phone,
          'parent': p.parentName + '(' + p.parentPhone + ')',
          'totalNum': p.totalNum,
          'targetNum': p.targetNum,
          'completionRate': p.completionRate
        }
        return people
      })
      commit('showPopup')
    })
    .catch(error => {
      console.dir(error)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        state.snackbarMsg = '美车师列表查询：' + (error.response.data && error.response.data.message) || '回应失败'
        commit('showSnackbar')
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
        state.snackbarMsg = '美车师列表查询：请求失败'
        commit('showSnackbar')
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
        state.snackbarMsg = '美车师列表查询：' + error.message
        commit('showSnackbar')
      }
    })
  },
  /* 订单查询 */
  getOrders ({commit, dispatch, state}, data) {
    // 订单状态（待接单：10，待服务：20，服务中：30，待付款：40，已支付：50,60，已取消：90，全部：20,30,40,50,60,90）
    if (!data.status) { // 默认显示待接单
      data.status = '10'
    }
    axios.get('/api/v2/fworker/rest/v/NewDashboard/orders?cityCode=' + data.cityCode + '&status=' + data.status)
    .then(res => {
      state.orders = res.data
      state.orders.map(o => dispatch('mapPoint', o))
    })
    .catch(error => {
      console.dir(error)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        state.snackbarMsg = '订单查询：' + (error.response.data && error.response.data.message) || '回应失败'
        commit('showSnackbar')
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
        state.snackbarMsg = '订单查询：请求失败'
        commit('showSnackbar')
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
        state.snackbarMsg = '订单查询：' + error.message
        commit('showSnackbar')
      }
    })
  },
  /* 离线美车师详情查询 */
  getWorkerDetail ({commit, state}, workerId) {
    axios.get('/api/v2/fworker/rest/v/NewDashboard/workerDetial?workerId=' + workerId)
    .then(res => {
      state.workerDetail = res.data
      commit('openInfoWindow', state.workerDetail)
    })
    .catch(error => {
      console.dir(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* 美车师查询 */
  getWorkers ({commit, dispatch, state}, data) {
    axios.get('/api/v2/fworker/rest/v/NewDashboard/workers?cityCode=' + data.cityCode + '&leaderId=' + data.leaderId)
    .then(res => {
      state.workers = res.data
      state.workers.map(w => dispatch('mapPoint', w))
    })
    .catch(error => {
      console.dir(error)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        state.snackbarMsg = '美车师查询：' + (error.response.data && error.response.data.message) || '回应失败'
        commit('showSnackbar')
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
        state.snackbarMsg = '美车师查询：请求失败'
        commit('showSnackbar')
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
        state.snackbarMsg = '美车师查询：' + error.message
        commit('showSnackbar')
      }
    })
  },
  /* 搜索栏查询 */
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
  /* POST 获取美车师结算设置列表 */
  getPreSaveWorkerMonthList ({commit, state}, data) {
    axios.post('/api/v2/fworker/rest/a/getPreSaveWorkerMonthList?workMonth=' + data.workMonth + '&cityCode=' + data.cityCode)
    .then(res => {
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
  /* POST /a/preSaveWorkerMonth 美车师奖惩结算预保存 */
  preSaveWorkerMonth ({dispatch, commit, state}, data) {
    axios.post('/api/v2/fworker/rest/a/preSaveWorkerMonth', data)
    .then(res => {
      state.snackbarMsg = '保存成功'
      dispatch('getPreSaveWorkerMonthList', {
        workMonth: data.workMonth,
        cityCode: data.cityCode
      })
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
  /* POST /a/doAddBonusPenalty 美车师结算入库 */
  doAddBonusPenalty ({commit, state}, data) {
    axios.post('/api/v2/fworker/rest/a/doAddBonusPenalty?workMonth=' + data.workMonth + '&cityCode=' + data.cityCode)
    .then(res => {
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
  /* GET /a/exportWorkMonth 导出奖惩月结算预存信息 */
  exportWorkMonth ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/exportWorkMonth?workMonth=' + data.workMonth + '&cityCode=' + data.cityCode, {
      responseType: 'blob'
    })
    .then(res => {
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
  /* POST /a/hasDoneBonusPenalty 是否已完成当月奖惩结算 */
  hasDoneBonusPenalty ({commit, state}, data) {
    axios.post('/api/v2/fworker/rest/a/hasDoneBonusPenalty?workMonth=' + data.workMonth + '&cityCode=' + data.cityCode)
    .then(res => {
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
  /* GET /a/getWorkerBonusPenaltyByMonth 获取美车师当月奖惩 */
  getWorkerBonusPenaltyByMonth ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/getWorkerBonusPenaltyByMonth?workMonth=' + data.workMonth + '&workerId=' + data.workerId)
    .then(res => {
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
  /* GET /a/exportBonusPenalty 导出指定美车师奖惩月结算信息 */
  exportBonusPenalty ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/exportBonusPenalty?workerId=' + data.workerId + '&workMonth=' + data.workMonth + '&cityCode=' + data.cityCode, {
      responseType: 'blob'
    })
    .then(res => {
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
  /* GET /a/cities 城市列表查询 */
  getCities ({commit, state}, data) {
    axios.get('/api/v2/fuser/rest/a/cities')
    .then(res => {
      state.cities = res.data
    })
    .catch(error => {
      console.dir(error)
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /rest/a/getSettlementStatistic 查询结算汇总信息接口 */
  getSettlementStatistic ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/getSettlementStatistic?cityCode=' + data.cityCode + '&month=' + data.month)
    .then(res => {
      state.settlementStatistic = res.data.map((w, index) => {
        const worker = {
          'workerId': w.workerId,
          'index': index + 1,
          'workerName': w.workerName,
          'orderFee': w.orderFee,
          'orderNum': w.orderNum,
          'reward': Number(w.reward),
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
  /* GET /rest/a/downSettlementStatistic 导出结算汇总信息接口 */
  downSettlementStatistic ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/downSettlementStatistic?cityCode=' + data.cityCode + '&month=' + data.month, {
      responseType: 'blob'
    })
    .then(res => {
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
  /* GET /rest/a/getSettlementByWorker 查询美车师结算接口 */
  getSettlementByWorker ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/getSettlementByWorker?workerId=' + data.workerId + '&month=' + data.month)
    .then(res => {
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
          'cityPlatformFee': 0 - Number(p.platformFee),
          'cityTotal': p.cityTotal,
          'platformFee': p.platformFee,
          'platformTotal': p.platformFee
        }
        return people
      })
      const last = state.modalTableData[state.modalTableData.length - 1]
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
  /* GET /rest/a/downSettlementByWorker 导出美车师结算接口 */
  downSettlementByWorker ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/a/downSettlementByWorker?workerId=' + data.workerId + '&month=' + data.month, {
      responseType: 'blob'
    })
    .then(res => {
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
  /* GET /rest/a/solveSettleProblem 美车师结算问题修复接口 */
  solveSettleProblem ({commit, state}, data) {
    state.snackbarMsg = '正在执行修复，请稍后……'
    commit('showSnackbar')
    axios.get('/api/v2/fworker/rest/a/solveSettleProblem?month=' + data.month)
    .then(res => {
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
  },
  /* GET /a/getGeneralOrderStatistics 查询概要运营数据 */
  getGeneralOrderStatistics ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest//a/getGeneralOrderStatistics?date=' + data.date + '&parentId=' + data.parentId + '&cityCode=' + data.cityCode)
    .then(res => {
      state.generalOrderStatistics = res.data
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '查询概要运营数据失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /a/getOperationTrendDate 查询运营统计数据 */
  getOperationTrendDate ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest//a/getOperationTrendDate?date=' + data.date + '&parentId=' + data.parentId + '&cityCode=' + data.cityCode + '&categoryCode=' + data.categoryCode)
    .then(res => {
      state.operationTrendData = res.data
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '查询运营统计数据失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /a/statisticsOperationData 统计运营数据 */
  statisticsOperationData ({commit, state}) {
    axios.get('/api/v2/fworker/rest//a/statisticsOperationData')
    .then(res => {
      state.snackbarMsg = res.data.resultMessage || '统计运营数据成功'
      commit('showSnackbar')
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '统计运营数据失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  },
  /* GET /a/getOperationTrendCity 查询运营对比数据 */
  getOperationTrendCity ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest//a/getOperationTrendCity?date=' + data.date + '&parentId=' + data.parentId + '&cityCode=' + data.cityCode + '&categoryCode=' + data.categoryCode)
    .then(res => {
      state.operationTrendCity = res.data
    })
    .catch(error => {
      console.dir(error)
      state.snackbarMsg = '查询运营对比数据失败'
      commit('showSnackbar')
      if (error.toString().indexOf('401') > -1) {
        router.push('login')
      }
    })
  }
}

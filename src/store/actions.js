import AMap from 'AMap'
import axios from 'axios'
import router from '../router'

export const actions = {
  /* 设置点标记 */
  mapPoint ({commit, dispatch, state}, obj) {
    const point = new AMap.Marker({
      map: state.amap,
      topWhenMouseOver: true, // 鼠标移上去时置顶
      position: [obj.lng || obj.longitude || 118.722695, obj.lat || obj.latitude || 32.033995],
      offset: !obj.workerId ? new AMap.Pixel(-24, -24) : new AMap.Pixel(-24, -48),
      title: myTitle(obj), // 鼠标滑过显示标题
      content: myMarker(obj), // 自定义点标记覆盖物内容,
      extData: {
        id: obj.orderId || obj.workerId
      }
    })
    point.on('click', function () {
      if (!obj.carInfo) { // 美车师
        dispatch('getWorkerDetail', obj.workerId)
      } else { // 订单
        commit('openInfoWindow', obj)
      }
    })
    point.on('rightclick', function () {
      // 右键点击标记点时，将标记点置于下一层，用于多个标记点重叠时
      const newzIndex = point.getzIndex() - 1
      point.setzIndex(newzIndex)
    })
    point.on('mouseout', function () {
      // 鼠标移出时，取消置顶
      point.setTop(false)
    })
    if (!obj.carInfo) { // 美车师
      state.workerPoints.push(point)
    } else {
      state.orderPoints.push(point)
    }
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
      oneError(commit, state, error, '配置权限查询')
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
      oneError(commit, state, error, '菜单权限查询')
      router.push('login')
    })
  },
  /* GET /v/NewDashboard/count 视图总情况查询 */
  getOverallCount ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/v/NewDashboard/count?cityCode=' + data.cityCode + '&leaderId=' + data.leaderId)
    .then(res => {
      state.overallCount = res.data
    })
    .catch(error => {
      oneError(commit, state, error, '视图总情况查询')
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
    if (data.workerId) {
      queryString += '&workerId=' + data.workerId
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
      state.modalTableHead = ['订单编号', '联系方式', '预约服务时间', '预约服务地点', '车牌', '预约服务类型', '数量', '完成时间', '订单状态', '备注']
      state.modalTableData = res.data.content.map(o => {
        const order = {
          'orderId': o.orderId,
          'userPhone': o.userPhone,
          'appointTime': formatTimeString(o.appointTime),
          'location': o.location,
          'carInfo': o.carInfo,
          'productName': o.productName,
          'count': o.count,
          'completeTime': o.completeTime,
          'orderStatus': formatOrderStatus(o.orderStatus),
          'remark': o.remark
        }
        return order
      })
      if (data.workerId) {
        // commit('toggleModalTable')
        state.showModalTable = true
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
      } else {
        commit('showPopup')
      }
    })
    .catch(error => {
      oneError(commit, state, error, '订单列表查询')
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
          'completionRate': (p.completionRate * 100).toFixed(2) + '%'
        }
        return people
      })
      commit('showPopup')
    })
    .catch(error => {
      oneError(commit, state, error, '美车师列表查询')
    })
  },
  /* 订单查询 */
  getOrders ({commit, dispatch, state}, data) {
    // 订单状态（待接单：10，待服务：20，服务中：30，待付款：40，已支付：50,60，已取消：90，全部：20,30,40,50,60,90）
    axios.get('/api/v2/fworker/rest/v/NewDashboard/orders?cityCode=' + data.cityCode + '&status=' + data.status)
    .then(res => {
      state.amap.remove(state.orderPoints)
      state.orderPoints = []
      state.orders = res.data
      state.orders.map(o => dispatch('mapPoint', o))
    })
    .catch(error => {
      oneError(commit, state, error, '订单查询')
    })
  },
  /* 美车师详情查询 */
  getWorkerDetail ({commit, state}, workerId) {
    axios.get('/api/v2/fworker/rest/v/NewDashboard/workerDetial?workerId=' + workerId)
    .then(res => {
      state.workerDetail = res.data
      commit('openInfoWindow', state.workerDetail)
    })
    .catch(error => {
      oneError(commit, state, error, '美车师详情查询')
    })
  },
  /* 美车师查询 */
  getWorkers ({commit, dispatch, state}, data) {
    axios.get('/api/v2/fworker/rest/v/NewDashboard/workers?cityCode=' + data.cityCode + '&leaderId=' + data.leaderId)
    .then(res => {
      state.workers = res.data
      const currentPoints = state.workerPoints.map(p => p.getExtData().id)
      state.workers.map(d => {
        const pos = currentPoints.indexOf(d.workerId)
        if (pos > -1) { // 已标记在地图上，则更新它
          const newPos = [d.lng || 118.722695, d.lat || 32.033995]
          const point = state.workerPoints[pos]
          point.moveTo(newPos, 5000)
          point.setContent(myMarker(d))
          point.setTitle(myTitle(d))
        } else {
          dispatch('mapPoint', d)
        }
      })
    })
    .catch(error => {
      oneError(commit, state, error, '美车师查询')
    })
  },
  /* 搜索栏查询 */
  doSearch ({commit, dispatch, state}, data) {
    let searchString = ''
    if (/^1\d{10}$/.test(data.input)) {
      searchString = 'phone=' + data.input
    } else if (/^[\u4e00-\u9fa5]{0,}$/.test(data.input)) {
      searchString = 'name=' + encodeURIComponent(data.input)
    } else {
      searchString = 'orderId=' + data.input
    }
    axios.get('/api/v2/fworker/rest/v/NewDashboard/search?cityCode=' + data.cityCode + '&leaderId=' + data.leaderId + '&' + searchString)
    .then(res => {
      const result = res.data
      if (result.order) {
        commit('openInfoWindow', result.order)
      } else if (result.workerDashboardVO) {
        if (result.workerDashboardVO.length > 1) {
          state.searchResultList = result.workerDashboardVO
        } else {
          dispatch('getWorkerDetail', result.workerDashboardVO[0].workerId)
        }
      } else {
        state.snackbarMsg = '没有搜到相关内容'
        commit('showSnackbar')
      }
    })
    .catch(error => {
      oneError(commit, state, error, '搜索')
    })
  },
  /* PUT /v/Dashboard/send 派单 */
  sendOrder ({commit, state}, data) {
    axios.put('/api/v2/fworker/rest/v/NewDashboard/send?orderId=' + data.orderId + '&workerId=' + data.workerId)
    .then(res => {
      state.snackbarMsg = '派单成功'
      commit('showSnackbar')
      // router.push('/')
    })
    .catch(error => {
      oneError(commit, state, error, '派单')
    })
  },
  /* POST 获取美车师结算设置列表 */
  getPreSaveWorkerMonthList ({commit, state}, data) {
    axios.post('/api/v2/fworker/rest/a/getPreSaveWorkerMonthList?workMonth=' + data.workMonth + '&cityCode=' + data.cityCode)
    .then(res => {
      state.preSaveWorkerMonthList = res.data
      state.workerTableHead = ['#', '姓名', '美车师账号', '上岗时间', '离职时间', '职务', '本月工作天数', '伯乐奖', '培训补贴天数', '延迟履约', '投诉追责', '费用骗取', '培训费用', '延迟接单', '服务不规范', '转单延迟1', '转单延迟2', '操作']
      state.workerTableData = res.data.map((w, index) => {
        const worker = {
          'workerId': w.workerId,
          'index': index + 1,
          'workerName': w.workerName,
          'phone': w.phone,
          'startDate': w.startDate,
          'quitDate': w.quitDate === null ? '在职' : w.quitDate,
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
      oneError(commit, state, error, '获取美车师结算设置列表')
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
      oneError(commit, state, error, '美车师奖惩结算保存')
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
      oneError(commit, state, error, '美车师结算入库')
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
      oneError(commit, state, error, '导出奖惩月结算信息')
    })
  },
  /* POST /a/hasDoneBonusPenalty 是否已完成当月奖惩结算 */
  hasDoneBonusPenalty ({commit, state}, data) {
    axios.post('/api/v2/fworker/rest/a/hasDoneBonusPenalty?workMonth=' + data.workMonth + '&cityCode=' + data.cityCode)
    .then(res => {
      commit('hasDoneBonusPenalty', res.data)
    })
    .catch(error => {
      oneError(commit, state, error, '查询当月奖惩结算完成状态')
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
      oneError(commit, state, error, '获取美车师当月奖惩')
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
      oneError(commit, state, error, '导出该美车师奖惩月结算信息')
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
      oneError(commit, state, error, '查询结算汇总信息')
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
      oneError(commit, state, error, '导出结算汇总信息')
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
      oneError(commit, state, error, '查询美车师结算')
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
      oneError(commit, state, error, '导出美车师结算')
    })
  },
  /* GET /a/getGeneralOrderStatistics 查询概要运营数据 */
  getGeneralOrderStatistics ({commit, state}, data) {
    axios.get('/api/v2/fworker/rest/v/getGeneralOrderStatistics?date=' + data.date + '&parentId=' + data.parentId + '&cityCode=' + data.cityCode)
    .then(res => {
      state.generalOrderStatistics = res.data
    })
    .catch(error => {
      oneError(commit, state, error, '查询概要运营数据')
    })
  },
  /* GET /a/getOperationTrendDate 查询运营统计数据 */
  getOperationTrendDate ({commit, state}, data) {
    return new Promise(function (resolve, reject) {
      axios.get('/api/v2/fworker/rest/v/getOperationTrendDate?date=' + data.date + '&parentId=' + data.parentId + '&cityCode=' + data.cityCode + '&categoryCode=' + data.categoryCode)
      .then(res => {
        state.operationTrendData = res.data
        resolve()
      })
      .catch(error => {
        oneError(commit, state, error, '查询运营统计数据')
      })
    })
  },
  /* POST /v/getTrendDataWithCondition 根据维度来查询运营数据作为对比 */
  getTrendDataWithCondition ({commit, state}, data) {
    return new Promise(function (resolve, reject) {
      axios.post('/api/v2/fworker/rest/v/getTrendDataWithCondition', {
        cityCode: data.cityCode,
        categoryCode: data.categoryCode,
        dimension: data.cityCode ? 'Group' : 'City',
        date: data.date
      })
      .then(res => {
        state.trendDataWithCondition = res.data
        resolve()
      })
      .catch(error => {
        oneError(commit, state, error, '查询运营对比数据')
      })
    })
  },
  /* POST /v/workerAdmin/getWorkersByStatus 查询美车师管理列表接口 */
  getWorkersByStatus ({commit, state}, data) {
    return new Promise(function (resolve, reject) {
      axios.post('/api/v2/fworker/rest/v/workerAdmin/getWorkersByStatus', {
        cityCode: data.cityCode,
        parentId: data.parentId,
        status: data.verify ? 0 : 1,
        phone: data.phone,
        startDay: data.startDay,
        endDay: data.endDay
      })
      .then(res => {
        state.workerManageList = res.data.map((w, index) => {
          const worker = {
            'workerId': w.workerId,
            'index': index + 1,
            'name': w.name,
            'phone': w.phone,
            'idCard': w.idCard,
            'applyTime': new Date(w.applyTime).toLocaleString(),
            'cityCode': w.cityCode
          }
          if (!data.verify) {
            worker.serviceStatus = w.serviceStatus
          }
          worker.workPhone = w.workPhone
          worker.group = w.parentId
          worker.position = w.position
          return worker
        })
        resolve()
      })
      .catch(error => {
        oneError(commit, state, error, '查询美车师管理列表')
      })
    })
  },
  /* POST /v/workerAdmin/changeToWorking 审核美车师接口 */
  changeToWorking ({commit, state}, data) {
    return new Promise(function (resolve, reject) {
      axios.post('/api/v2/fworker/rest/v/workerAdmin/changeToWorking', {
        workerId: data.workerId,
        parentId: data.parentId,
        workPhone: data.workPhone,
        position: data.position
      })
      .then(res => {
        state.snackbarMsg = '美车师审核成功：' + res.data.resultMessage
        commit('showSnackbar')
        resolve()
      })
      .catch(error => {
        oneError(commit, state, error, '审核美车师')
      })
    })
  },
  /* POST /v/workerAdmin/changeWorkerInfo 修改美车师信息接口 */
  changeWorkerInfo ({commit, state}, data) {
    return new Promise(function (resolve, reject) {
      axios.post('/api/v2/fworker/rest/v/workerAdmin/changeWorkerInfo', {
        workerId: data.workerId,
        parentId: data.parentId,
        workPhone: data.workPhone,
        position: data.position
      })
      .then(res => {
        state.snackbarMsg = '修改美车师信息成功：' + res.data.resultMessage
        commit('showSnackbar')
        resolve()
      })
      .catch(error => {
        oneError(commit, state, error, '修改美车师信息')
      })
    })
  },
  /* POST /v/workerAdmin/workerQuit 注销美车师接口 */
  workerQuit ({commit, state}, data) {
    return new Promise(function (resolve, reject) {
      axios.post('/api/v2/fworker/rest/v/workerAdmin/workerQuit', {
        workerId: data.workerId,
        quitTime: data.quitTime
      })
      .then(res => {
        state.snackbarMsg = '注销美车师成功：' + res.data.resultMessage
        commit('showSnackbar')
        resolve()
      })
      .catch(error => {
        oneError(commit, state, error, '注销美车师')
      })
    })
  },
  /* GET /a/getDictionaryByCode 根据字典码查询字典数据 */
  getDictionaryByCode ({commit, state}, code) {
    return new Promise(function (resolve, reject) {
      axios.get('/api/v2/fworker/rest/a/getDictionaryByCode?code=' + code)
      .then(res => {
        state.dictionary = res.data
        resolve()
      })
      .catch(error => {
        oneError(commit, state, error, '查询字典数据')
      })
    })
  }
}
// 点标记自定义标题
function myTitle (obj) {
  const name = obj.userName || obj.name
  const phone = obj.phone || obj.userPhone
  let str = ''
  if (name) {
    str += name
    str += '：'
  }
  if (phone) {
    str += phone
  }
  return str
}
// 点标记的自定义div
function myMarker (obj) {
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
  return div
}
// 通用的错误处理
function oneError (commit, state, error, name) {
  console.dir(error)
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data)
    state.snackbarMsg = name + '失败：' + (error.response.data && error.response.data.message) || '回应失败'
    commit('showSnackbar')
    console.log(error.response.status)
    console.log(error.response.headers)
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request)
    state.snackbarMsg = name + '失败：请求失败'
    commit('showSnackbar')
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message)
    state.snackbarMsg = name + '失败：' + error.message
    commit('showSnackbar')
  }
}

<template>
<div>
  <div id="headSearchBox">
    <avatar />
    <div class="search-box">
      <mu-text-field hintText="搜索……" class="search-input" />
      <mu-flat-button icon="search" class="search-button" backgroundColor="#F05B47" color="#FFF"/>
    </div>
    <div class="search-city">
      <mu-select-field value="1" class="search-city-select">
        <mu-menu-item value="1" title="南京"/>
      </mu-select-field>
    </div>
  </div>
  <div id="orderStatusBox">
    <status-box icon="assignment" title="订单状况" arrowPosition="right" />
    <status-box :number="overallCount.orderCount" title="当日订单" direction="row" />
    <status-box :number="overallCount.toBeServiceCount" title="待服务订单" direction="row" />
    <status-box :number="overallCount.inServiceCount" title="服务中订单" direction="row" />
    <status-box :number="overallCount.cancelCount" title="已取消订单" direction="row" />
    <status-box :number="overallCount.payCount" title="已支付订单" direction="row" />
    <status-box :number="overallCount.toBeAcceptCount" title="待接单订单" direction="row" clickable="clickable" @click="showModal('待接单订单', 'order')" />
  </div>
  <div id="serviceStatusBox">
    <status-box icon="people" title="美车师" arrowPosition="bottom" />
    <status-box :number="overallCount.inWorkerCount" title="在线人数" direction="column" />
    <status-box :number="overallCount.outWorkerCount" title="离线人数" direction="column" clickable="clickable" @click="showModal('当前离线', 'people')" />
    <status-box :number="overallCount.busyWorkerCount" title="忙碌人数" direction="column" />
    <status-box :number="overallCount.freeWorkerCount" title="空闲人数" direction="column" />
  </div>
  <Modal :title="modalTitle" :tableHead="tableHead" :tableData="tableData"/>
</div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import paper from 'muse-components/paper'
import {flexbox, flexboxItem} from 'muse-components/flexbox'
import raisedButton from 'muse-components/raisedButton'
import textField from 'muse-components/textField'
import flatButton from 'muse-components/flatButton'
import selectField from 'muse-components/selectField'
import {menuItem} from 'muse-components/menu'
import statusBox from './units/statusBox'
import avatar from './units/avatar'
import Modal from './Modal'

Vue.component(paper.name, paper)
Vue.component(flexbox.name, flexbox)
Vue.component(flexboxItem.name, flexboxItem)
Vue.component(raisedButton.name, raisedButton)
Vue.component(textField.name, textField)
Vue.component(flatButton.name, flatButton)
Vue.component(selectField.name, selectField)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'dashboard',
  components: {
    'status-box': statusBox,
    // 'status-title-box': statusTitleBox,
    'avatar': avatar,
    Modal
  },
  data () {
    return {
      dashboard: {
        finished: 309,
        processing: 211,
        todo: 1234
      },
      timeInterval: {},
      modalTitle: '',
      tableHead: [],
      tableData: []
      // orderTableHead: ['订单编号', '联系方式', '预约服务时间', '预约服务地点', '车牌', '预约服务类型'],
      // orderTableData: [
      //   {
      //     orderId: 'W1702170012811',
      //     phone: '15951813408',
      //     time: '2017/3/12 10:00',
      //     location: '集庆门大街18号',
      //     license: '苏A12883',
      //     type: '五座轿车清洗加内饰清洗'
      //   }
      // ],
      // peopleTableHead: ['姓名', '联系方式', '所属小组'],
      // peopleTableData: [
      //   {
      //     name: '张玉华',
      //     phone: '15951813408',
      //     type: '联创大厦'
      //   }
      // ]
    }
  },
  computed: {
    ...mapState([
      'overallCount',
      'todayOrderList',
      'offlineWorkerList',
      'tableHead',
      'tableData'
    ])
  },
  mounted () {
    this.dashboard.finished = Math.floor(Math.random() * 1000)
    this.dashboard.processing = Math.floor(Math.random() * 1000)
    this.dashboard.todo = Math.floor(Math.random() * 1000)
    const z = this
    const update = () => {
      // 获取视图总情况查询
      z.getOverallCount()
      // 获取美车师位置和待接单位置
      z.getWorkers()
      z.getOrders()
    }
    update()
    setTimeout(function () { // 每隔固定时间更新数据
      update()
    }, 1000 * 60 * 5)
  },
  methods: {
    ...mapMutations([
      'removeMarkers',
      'resetView',
      'doGeneratePoints',
      'showPopup'
    ]),
    ...mapActions([
      'getOverallCount',
      'getOrderList',
      'getWorkerList',
      'getWorkers',
      'getOrders'
    ]),
    autoPoints () {
      const z = this
      z.timeInterval = setInterval(() => {
        for (let i = 0; i < 20; i++) {
          z.doGeneratePoints()
        }
      }, 3000)
    },
    removePoints () {
      clearInterval(this.timeInterval)
      this.removeMarkers()
    },
    showModal (title, type) {
      const z = this
      z.modalTitle = title
      // function show () {
      //   z.tableHead = type === 'order' ? z.orderTableHead : z.peopleTableHead
      //   z.tableData = type === 'order' ? z.todayOrderList : z.offlineWorkerList
      //   z.showPopup()
      // }
      // new Promise ((resolve, reject) => {
      // })
      if (type === 'order') {
        z.getOrderList('10')
      } else if (type === 'people') {
        z.getWorkerList()
      }
    }
  }
}
</script>

<style>
.amap-toolbar {
  top: 80px !important;
}
#headSearchBox {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  display: flex;
}
#headSearchBox .search-box {
  box-shadow: 0px 0px 6px 0px #bdbdbd;
  background-color: #fff;
  height: 36px;
  margin-top: 6px;
  margin-left: 20px;
}
#headSearchBox .search-input {
  top: -5px;
  left: 2px;
}
#headSearchBox .search-button {
  width: 48px;
  min-width: 48px;
}
#headSearchBox .search-city {
  box-shadow: 0px 0px 6px 0px #bdbdbd;
  background-color: #fff;
  height: 36px;
  margin-top: 5px;
  margin-left: 10px;
  padding: 0 10px;
  min-height: 36px;
}
#headSearchBox .search-city-select {
  width: 5em;
  top: -1px;
}
#orderStatusBox {
  position: absolute;
  top: 0;
  right: 10px;
  z-index: 100;
  display: flex;
}
#orderStatusBox .status-box{
  box-shadow: 0px 0px 6px 0px #bdbdbd;
}
#serviceStatusBox {
  position: absolute;
  top: 150px;
  right: 10px;
  z-index: 100;
  display: flex;
  flex-direction: column;
}
#serviceStatusBox .status-box{
  box-shadow: 0px 0px 6px 0px #bdbdbd;
}
#dashboard {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  width: 320px;
}
h1, h2 {
  font-weight: normal;
  text-align: center;
}
button.raised-button {
  margin: 10px;
}
</style>

<template>
<div>
  <div id="headSearchBox">
    <avatar />
    <div class="search-box">
      <mu-text-field hintText="搜索完整手机号或单号后三位" class="search-input" v-model="searchString" ref="searchField"/>
      <mu-flat-button icon="search" class="search-button" backgroundColor="#F05B47" color="#FFF" @click="search()"/>
    </div>
    <Group />
  </div>
  <div id="orderStatusBox">
    <status-box icon="assignment" title="订单状况" arrowPosition="right" />
    <status-box :number="overallCount.orderCount" title="当日订单" direction="row" clickable="clickable" @click="showModal('当日订单', 'order', 'all')" />
    <status-box :number="overallCount.toBeServiceCount" title="待服务订单" direction="row" />
    <status-box :number="overallCount.inServiceCount" title="服务中订单" direction="row" />
    <status-box :number="overallCount.cancelCount" title="已取消订单" direction="row" />
    <status-box :number="overallCount.payCount" title="已支付订单" direction="row" />
    <status-box :number="overallCount.toBeAcceptCount" title="待接单订单" direction="row" clickable="clickable" @click="showModal('待接单订单', 'order', 'wait')" />
  </div>
  <div id="serviceStatusBox">
    <status-box icon="people" title="美车师" arrowPosition="bottom" />
    <status-box :number="overallCount.inWorkerCount" title="在线人数" direction="column" />
    <status-box :number="overallCount.outWorkerCount" title="离线人数" direction="column" clickable="clickable" @click="showModal('当前离线', 'people')" />
    <status-box :number="overallCount.busyWorkerCount" title="忙碌人数" direction="column" />
    <status-box :number="overallCount.freeWorkerCount" title="空闲人数" direction="column" />
  </div>
  <Modal :title="modalTitle" />
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
import Group from './units/group'
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
    'avatar': avatar,
    Modal,
    Group
  },
  data () {
    return {
      searchString: '',
      modalTitle: ''
    }
  },
  computed: {
    ...mapState([
      'overallCount',
      'todayOrderList',
      'offlineWorkerList',
      'workerTableHead',
      'workerTableData',
      'workers',
      'orders',
      'todayOrdersPage',
      'todayOrdersPageSize'
    ])
  },
  mounted () {
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
      // // 移除点标记
      // z.removeMarkers()
      update()
    }, 1000 * 60 * 5)
    // 搜索框，按回车键执行搜索
    const input = z.$refs.searchField.$el.querySelector('input')
    input.addEventListener('keyup', function (event) {
      if (event.keyCode === 13) {
        z.search()
      }
    })
  },
  methods: {
    ...mapMutations([
      'removeMarkers',
      'resetView',
      'showPopup'
    ]),
    ...mapActions([
      'getOverallCount',
      'getOrderList',
      'getWorkerList',
      'getWorkers',
      'getOrders',
      'doSearch'
    ]),
    showModal (title, type, sub) {
      const z = this
      z.modalTitle = title
      if (type === 'order') {
        if (sub === 'wait' && z.overallCount.toBeAcceptCount > 0) {
          z.getOrderList({
            orderStatus: '10'
          })
        } else if (sub === 'all' && z.overallCount.orderCount > 0) {
          z.getOrderList({
            orderStatus: '',
            page: z.todayOrdersPage - 1,
            size: z.todayOrdersPageSize
          })
        }
      } else if (type === 'people' && z.overallCount.outWorkerCount > 0) {
        z.getWorkerList()
      }
    },
    search () {
      const z = this
      let t = {
        type: 'order',
        input: z.searchString
      }
      if (/^1\d{10}$/.test(z.searchString)) {
        t.type = 'phone'
      }
      if (t.input !== '') {
        z.doSearch(t)
      }
    }
  },
  watch: {
    todayOrdersPage: function () {
      this.showModal('当日订单', 'order', 'all')
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
  left: 80px;
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
  padding: 0 0.5em;
}
#headSearchBox .search-button {
  width: 48px;
  min-width: 48px;
}
#headSearchBox .city-select, #headSearchBox .group-select {
  box-shadow: 0px 0px 6px 0px #bdbdbd;
  background-color: #fff;
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

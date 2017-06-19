<template>
<div id="homeMapBox">
  <div id="headSearchBox">
    <div class="search-box">
      <mu-text-field hintText="搜索姓名、手机号、单号后三位" class="search-input" v-model="searchString" ref="searchField"/>
      <mu-flat-button icon="search" class="search-button" backgroundColor="#F05B47" color="#FFF" @click="search()"/>
      <mu-menu v-if="searchResultList.length" class="search-result-list" :value="searchResultListSelected">
        <mu-menu-item v-for="item,index in searchResultList" :title="item.name + '：' + item.phone" leftIcon="person_pin" :value="item.workerId" :key="item.workerId" @click="searchResultListClick(item.workerId)" />
        <mu-menu-item title="关闭搜索结果框" leftIcon="close" @click="closeSearchResult" />
      </mu-menu>
    </div>
  </div>
  <div id="orderStatusBox">
    <status-box icon="assignment" title="订单状况" arrowPosition="right" @click="toggleOrderBox" />
    <status-box
      :number="overallCount.orderCount"
      title="当日订单"
      direction="row"
      clickable="clickable"
      @click="showModal('当日订单', 'order', '20,30,40,50,60,90', overallCount.orderCount)"
      v-if="showOrderBox"
    />
    <status-box
      :number="overallCount.toBeAcceptCount"
      title="待接单订单"
      direction="row"
      clickable="clickable"
      @click="showModal('待接单订单', 'order', '10', overallCount.toBeAcceptCount)"
      v-if="showOrderBox"
    />
    <status-box
      :number="overallCount.toBeServiceCount"
      title="待服务订单"
      direction="row"
      clickable="clickable"
      @click="showModal('待服务订单', 'order', '20', overallCount.toBeServiceCount)"
      v-if="showOrderBox"
    />
    <status-box
      :number="overallCount.inServiceCount"
      title="服务中订单"
      direction="row"
      clickable="clickable"
      @click="showModal('服务中订单', 'order', '30', overallCount.inServiceCount)"
      v-if="showOrderBox"
    />
    <status-box
      :number="overallCount.toPayCount"
      title="待支付订单"
      direction="row"
      clickable="clickable"
      @click="showModal('待支付订单', 'order', '40', overallCount.toPayCount)"
      v-if="showOrderBox"
    />
    <status-box
      :number="overallCount.payCount"
      title="已支付订单"
      direction="row"
      clickable="clickable"
      @click="showModal('已支付订单', 'order', '50,60', overallCount.payCount)"
      v-if="showOrderBox"
    />
    <status-box
      :number="overallCount.cancelCount"
      title="已取消订单"
      direction="row"
      clickable="clickable"
      @click="showModal('已取消订单', 'order', '90', overallCount.cancelCount)"
      v-if="showOrderBox"
    />
  </div>
  <div id="serviceStatusBox">
    <status-box icon="people" title="美车师" arrowPosition="bottom" @click="toggleWorkerBox" />
    <status-box
      :number="overallCount.inWorkerCount"
      title="在线人数"
      direction="column"
      clickable="clickable"
      @click="showModal('当前在线', 'people', '1', overallCount.inWorkerCount)"
      v-if="showWorkerBox"
    />
    <status-box
      :number="overallCount.outWorkerCount"
      title="离线人数"
      direction="column"
      clickable="clickable"
      @click="showModal('当前离线', 'people', '2', overallCount.outWorkerCount)"
      v-if="showWorkerBox"
    />
    <status-box
      :number="overallCount.busyWorkerCount"
      title="忙碌人数"
      direction="column"
      clickable="clickable"
      @click="showModal('当前忙碌', 'people', '3', overallCount.busyWorkerCount)"
      v-if="showWorkerBox"
    />
    <status-box
      :number="overallCount.freeWorkerCount"
      title="空闲人数"
      direction="column"
      clickable="clickable"
      @click="showModal('当前空闲', 'people', '4', overallCount.freeWorkerCount)"
      v-if="showWorkerBox"
    />
  </div>
  <Modal :title="modalTitle" :changePage="getList" :cellButtons="true" />
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
import {menu, menuItem} from 'muse-components/menu'
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
Vue.component(menu.name, menu)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'dashboard',
  components: {
    'status-box': statusBox,
    'avatar': avatar,
    Modal
  },
  data () {
    return {
      searchString: '',
      modalTitle: '',
      modalType: '',
      modalParams: {},
      searchResultListSelected: '',
      showOrderBox: true,
      showWorkerBox: true
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
      'pagination',
      'isLoadingConfig',
      'searchResultList',
      'city',
      'group'
    ])
  },
  mounted () {
    const z = this
    // 修复切换页面后，不显示美车师的点标记
    z.clearWorkerPoints()
    const initUpdate = setInterval(function () {
      if (!this.isLoadingConfig) {
        z.update()
        // 视图自适应
        // setTimeout(function () {
        //   z.resetView()
        // }, 3000)
        clearInterval(initUpdate)
      }
    }, 100)
    setInterval(function () { // 每隔固定时间更新数据
      z.update()
    }, 1000 * 60 * 5)
    // 搜索框，按回车键执行搜索
    const input = z.$refs.searchField.$el.querySelector('input')
    input.addEventListener('keyup', function (event) {
      if (event.keyCode === 13) {
        z.search()
      }
    })
  },
  watch: {
    city: function () {
      this.centerMap(this.city)
    },
    group: function () {
      this.clearWorkerPoints()
      this.update()
    }
  },
  methods: {
    ...mapMutations([
      'resetView',
      'clearSearchResult',
      'centerMap',
      'clearWorkerPoints',
      'hideModalTable'
    ]),
    ...mapActions([
      'getOverallCount',
      'getOrderList',
      'getWorkerList',
      'getWorkers',
      'getWorkerDetail',
      'getOrders',
      'doSearch'
    ]),
    update () {
      const z = this
      // 获取视图总情况查询
      z.getOverallCount({
        cityCode: z.city,
        leaderId: z.group
      })
      // 获取美车师位置和待接单位置
      z.getWorkers({
        cityCode: z.city,
        leaderId: z.group
      })
      // 获取待接单订单
      z.getOrders({
        status: '10',
        cityCode: z.city,
        leaderId: z.group
      })
    },
    // changeCityGroup () {
    //   this.clearWorkerPoints()
    //   this.update()
    // },
    // changeCity () {
    //   // 地图按城市居中
    //   this.centerMap(this.city)
    // },
    showModal (title, type, status, number) {
      if (number) {
        const z = this
        z.modalTitle = title
        z.modalType = type
        z.pagination.page = 0
        z.modalParams = {
          status: status
        }
        z.getList()
      }
    },
    getList () {
      const z = this
      z.modalParams = Object.assign({}, z.modalParams, {
        cityCode: z.city,
        leaderId: z.group
      }, z.pagination)
      if (z.modalType === 'order') {
        z.getOrderList(z.modalParams)
      } else if (z.modalType === 'people') {
        z.getWorkerList(z.modalParams)
      }
      z.hideModalTable()
    },
    search () {
      const z = this
      let t = {
        input: z.searchString,
        cityCode: z.city,
        leaderId: z.group
      }
      if (t.input !== '') {
        z.doSearch(t)
      }
    },
    searchResultListClick (workerId) {
      this.searchResultListSelected = workerId
      this.getWorkerDetail(workerId)
    },
    closeSearchResult () {
      this.searchString = ''
      this.clearSearchResult()
    },
    toggleOrderBox () {
      this.showOrderBox = !this.showOrderBox
    },
    toggleWorkerBox () {
      this.showWorkerBox = !this.showWorkerBox
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
  position: relative;
  box-shadow: 0px 0px 6px 0px #bdbdbd;
  background-color: #fff;
  height: 36px;
  margin-top: 6px;
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
#headSearchBox .search-result-list {
  position: absolute;
  top: 40px;
  left: 0;
  box-shadow: 0px 0px 6px 0px #bdbdbd;
  background-color: #fff;
}
#headSearchBox .mu-menu-item-title {
  margin-left: -20px;
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
.order-table>div>div:nth-child(2) {
  max-height: calc(80vh - 120px);
  overflow-y: auto;
}
@media screen and (max-width:1366px) {
  #headSearchBox {
    flex-wrap: wrap-reverse;
    max-width: 320px;
  }
  #headSearchBox .city-select, #headSearchBox .group-select {
    margin-left: 0;
    margin-top: -6px;
  }
  #headSearchBox .city-select-field, #headSearchBox .group-select-field {
    width: 132px;
  }
}
@media screen and (max-width:1130px) {
  #headSearchBox .select-box {
    max-width: 160px;
  }
  #headSearchBox .city-select, #headSearchBox .group-select {
    margin-top: 0;
  }
}
</style>

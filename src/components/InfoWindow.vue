<template>
<div id="infoWindowUI" style="display:none;">
    <div class="info-window-head">
      <avatar :src="infoData.avatar" />
      <div class="info-window-head-title">
        <h3>
          {{infoData.name}} <span v-if="infoData.type === 'worker'"> 美车师</span>
          <mu-badge v-if="infoData.status" :content="infoData.status" :class="(infoData.status === '未超时' || infoData.status === '空闲') ? 'badge-green' : infoData.status === '已下线' ? 'badge-grey' : ''" secondary/>
        </h3>
        <div v-if="infoData.type === 'worker'" class="icon-container" v-bind:style="{width: infoData.star * 24 + 'px' }">
          <mu-icon value="star"/>
          <mu-icon value="star"/>
          <mu-icon value="star"/>
          <mu-icon value="star"/>
          <mu-icon value="star"/>
        </div>
        <mu-badge v-if="infoData.type === 'worker'" :content="String(infoData.star)" primary/>
        <div v-if="infoData.type === 'order'">订单编号：{{infoData.orderId}}</div>
        <div v-if="infoData.type === 'worker'" class="worker-rate-box">
          <div class="progress-box" :title="'月完成单量：' + infoData.totalNum">
            <div class="progress-rate" :style="{width: infoData.completionRate + '%'}"></div>
            <div class="rate-span" :style="{width: infoData.completionRate + '%'}">{{infoData.completionRate}}%</div>
          </div>
          <div class="target-span" style="float: right;">月目标单量：{{infoData.targetNum}}</div>
        </div>
      </div>
    </div>
    <mu-list class="info-window-location-info">
      <mu-list-item :title="infoData.address">
        <mu-icon slot="left" value="location_on" color="red400"/>
      </mu-list-item>
      <mu-list-item :title="infoData.account">
        <mu-icon slot="left" value="local_phone" color="red400"/>
      </mu-list-item>
      <mu-list-item v-if="infoData.type === 'order'" :title="infoData.time">
        <mu-icon slot="left" value="schedule" color="red400"/>
      </mu-list-item>
      <mu-list-item v-if="infoData.type === 'order'" :title="infoData.license">
        <mu-icon slot="left" value=":license-icon" color="red400"/>
      </mu-list-item>
      <mu-list-item v-if="infoData.type === 'order'" :title="infoData.orderType">
        <mu-icon slot="left" value=":service-icon" color="red400"/>
      </mu-list-item>
    </mu-list>
    <div v-if="infoData.type === 'worker'">
    <mu-divider />
    <div class="info-window-flex">
      <status-box :number="infoData.totalOrders" title="总订单" direction="row" clickable="clickable" @click="toggleModal('20,30,40,50,60,90', infoData.totalOrders)" :selected="(showModalTable && (orderStatusCode === '20,30,40,50,60,90')) ? 'selected' : ''" />
      <status-box :number="infoData.currentOrders" title="已完成" direction="row" clickable="clickable" @click="toggleModal('50,60', infoData.currentOrders)" :selected="(showModalTable && (orderStatusCode === '50,60')) ? 'selected' : ''" />
      <status-box :number="infoData.toBePayCount" title="待支付" direction="row" clickable="clickable" @click="toggleModal('40', infoData.toBePayCount)" :selected="(showModalTable && (orderStatusCode === '40')) ? 'selected' : ''" />
      <status-box :number="infoData.cancleCount" title="已取消" direction="row" clickable="clickable" @click="toggleModal('90', infoData.cancleCount)" :selected="(showModalTable && (orderStatusCode === '90')) ? 'selected' : ''" />
      <status-box :number="infoData.inServiceCount" title="服务中" direction="row" clickable="clickable" @click="toggleModal('30', infoData.inServiceCount)" :selected="(showModalTable && (orderStatusCode === '30')) ? 'selected' : ''" />
      <status-box :number="infoData.todoOrders" title="待服务" direction="row" clickable="clickable" @click="toggleModal('20', infoData.todoOrders)" :selected="(showModalTable && (orderStatusCode === '20')) ? 'selected' : ''" />
    </div>
    <mu-divider />    
    <mu-text-field label="输入派单单号" labelFloat fullWidth class="send-order-input" v-model="orderId" />
    <mu-raised-button label="派单" class="send-order-btn" @click="pushOrder()" secondary/>
    <transition name="order-table-slide">
      <ModalTable v-if="showModalTable" class="order-table" height="434px" :change="getList" />
    </transition>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import icon from 'muse-components/icon'
import raisedButton from 'muse-components/raisedButton'
import textField from 'muse-components/textField'
import badge from 'muse-components/badge'
import divider from 'muse-components/divider'
import {list, listItem} from 'muse-components/list'
import avatar from './units/avatar'
import statusBox from './units/statusBox'
import ModalTable from './ModalTable'

Vue.component(icon.name, icon)
Vue.component(raisedButton.name, raisedButton)
Vue.component(textField.name, textField)
Vue.component(badge.name, badge)
Vue.component(divider.name, divider)
Vue.component(list.name, list)
Vue.component(listItem.name, listItem)
Vue.component(avatar.name, avatar)
export default {
  name: 'infoWindow',
  components: {
    avatar,
    statusBox,
    ModalTable
  },
  props: {
    infoData: {
      type: Object,
      default: {
        account: '10000000',
        name: '某某',
        star: '5',
        location: [0, 0],
        address: 'somewhere',
        currentOrders: 0,
        totalOrders: 0,
        todoOrders: 0
      }
    },
    type: {
      type: String,
      default: 'worker'
    }
  },
  data () {
    return {
      orderId: '',
      orderStatusCode: '',
      workerId: '',
      modalParams: {}
    }
  },
  computed: {
    ...mapState([
      'showModalTable',
      'workerDetail',
      'pagination',
      'city',
      'group'
    ])
  },
  methods: {
    ...mapMutations([
      'toggleModalTable'
    ]),
    ...mapActions([
      'getOrderList',
      'sendOrder'
    ]),
    pushOrder () {
      const z = this
      const data = {
        orderId: z.orderId,
        workerId: z.infoData.workerId
      }
      z.sendOrder(data)
    },
    toggleModal (status, number) {
      if (number) {
        const z = this
        z.toggleModalTable()
        if ((z.orderStatusCode !== status) || (z.infoData.workerId !== z.workerId)) {
          z.orderStatusCode = status
          z.workerId = z.infoData.workerId
          z.pagination.page = 0
          z.modalParams = {
            status: status,
            workerId: z.infoData.workerId
          }
          z.getList()
        }
      }
    },
    getList () {
      const z = this
      z.modalParams = Object.assign({}, z.modalParams, {
        cityCode: this.city,
        leaderId: this.group
      }, z.pagination)
      z.getOrderList(z.modalParams)
    }
  }
}
</script>
<style>
#infoWindowUI {
  z-index: 170;
  width: 384px;
  padding: 10px;
}
.amap-info-content {
  padding: 10px;
}
.amap-info-close {
  right: 10px !important;
  top: 10px;
  width: 32px;
  height: 32px;
  font-weight: 100;
  font-family: 'Material Icons';
  font-size: 48px;
  cursor: pointer;
}
#infoWindowUI .info-window-head {
  display: flex;
}
#infoWindowUI .info-window-head-title {
  margin-left: 32px;
  width: 100%;
}
#infoWindowUI .info-window-head-title h3 {
  font-weight: normal;
  font-size: 18px;
  color: #333;
  margin: 0;
}
#infoWindowUI .info-window-location-info .mu-item.show-left {
  padding-left: 48px;
}
#infoWindowUI .info-window-location-info .mu-item-title {
  font-size: 18px;
  line-height: 1.2;
  color: #333;
}
#infoWindowUI .info-window-flex {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
#infoWindowUI .info-window-flex h4 {
  margin-top: 24px;
  margin-bottom: 14px;
  font-size: 24px;
  font-weight: normal;
  line-height: 1;
}
#infoWindowUI .info-window-flex h5 {
  font-size: 14px;
  font-weight: normal;
  line-height: 1;
  margin-top: 0;
  margin-bottom: 24px;
}
#infoWindowUI .send-order-input {
  margin-top: 16px;
}
#infoWindowUI .send-order-btn {
  width: 100%;
  height: 46px;
  font-size: 18px;
  line-height: 46px;
}
#infoWindowUI .order-table {
  position: absolute;
  top: 0;
  left: calc(100% + 16px);
  box-shadow: 0 0 10px 0px #757575;
  width: 942px;
}
#infoWindowUI .order-table:after {
  content: '';
  position: absolute;
  top: 280px;
  left: -32px;
  border: 16px solid transparent;
  border-right-color: #fff;
}
#infoWindowUI .order-table>div>div:nth-child(2) {
  max-height: initial;
  overflow-y: auto;
}
#infoWindowUI .order-table .mu-th,
#infoWindowUI .order-table .mu-td {
  padding: 10px;
}
.order-table-slide-enter-active {
  transition: all .3s ease;
}
.order-table-slide-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.order-table-slide-enter, .order-table-slide-leave-active {
  transform: translateX(10px);
  opacity: 0;
}
.order-table {
  background-color: #fff;
}
.license-icon {
  width: 24px;
  height: 24px;
  background-image: url(../../static/license.png)
}
.service-icon {
  width: 24px;
  height: 24px;
  background-image: url(../../static/service.png)
}
#infoWindowUI .mu-item-wrapper {
  user-select: initial !important;
}
#infoWindowUI .badge-green .mu-badge {
  background-color: #009944;
}
#infoWindowUI .badge-grey .mu-badge {
  background-color: #7e848c;
}
#infoWindowUI .status-box .status-button {
  width: 58px;
  min-width: 58px;
}
#infoWindowUI .worker-rate-box {
  display: flex;
}
#infoWindowUI .worker-rate-box .progress-box {
  position: relative;
  height: 20px;
  border-radius: 10px;
  flex: 1 1 auto;
  background-color: #bbbfc4;
  overflow: hidden;
}
#infoWindowUI .worker-rate-box .progress-box .progress-rate {
  position: absolute;
  top: 0;
  height: 20px;
  border-radius: 10px;
  background-color: #F05B47;
}
#infoWindowUI .worker-rate-box .progress-box .rate-span {
  position: relative;
  top: 0;
  color: #fff;
  text-align: right;
  padding: 0 5px;
}
#infoWindowUI .worker-rate-box .target-span {
  padding: 0 5px;
}
#infoWindowUI .icon-container {
  display: inline-block;
  margin: 5px;
  vertical-align: middle;
  color: #ffeb3b;
  word-spacing: -4px;
  white-space: nowrap;
  overflow: hidden;
}
#infoWindowUI .status-box.selected .status-button {
  background-color: #fffde7 !important;
}
</style>

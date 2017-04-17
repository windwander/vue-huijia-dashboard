<template>
<div id="infoWindowUI" style="display:none;">
    <div class="info-window-head">
      <avatar />
      <div class="info-window-head-title">
        <h3>
          {{infoData.name}} <span v-if="infoData.type === 'worker'"> 美车师</span>
          <mu-badge :content="infoData.status" secondary/>
        </h3>
        <div v-if="infoData.type === 'worker'" class="icon-contaner" v-bind:style="{width: infoData.star * 24 + 'px' }">
          <mu-icon value="star"/>
          <mu-icon value="star"/>
          <mu-icon value="star"/>
          <mu-icon value="star"/>
          <mu-icon value="star"/>
        </div>
        <mu-badge v-if="infoData.type === 'worker'" :content="infoData.star" primary/>
        <div v-if="infoData.type === 'order'">订单编号：{{infoData.orderId}}</div>
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
      <status-box :number="infoData.totalOrders" title="总订单量" direction="row" />
      <status-box :number="infoData.currentOrders" title="已完成" direction="row" />
      <status-box :number="infoData.todoOrders" title="待服务" direction="row" clickable="clickable" @click="toggleOrderTable()" />
    </div>
    <mu-divider />    
    <mu-text-field label="输入派单单号" labelFloat fullWidth class="send-order-input" v-model="orderId" />
    <mu-raised-button :label="pushOrderText" class="send-order-btn" @click="pushOrder()" :disabled="isPushingOrder" secondary/>
    <transition name="order-table-slide">
      <OrderTable v-if="showOrderTable" class="order-table" height="406px" :tableHead="tableHead" :tableData="tableData"/>
    </transition>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import icon from 'muse-components/icon'
import raisedButton from 'muse-components/raisedButton'
import textField from 'muse-components/textField'
import badge from 'muse-components/badge'
import divider from 'muse-components/divider'
import {list, listItem} from 'muse-components/list'
import avatar from './units/avatar'
import statusBox from './units/statusBox'
import OrderTable from './OrderTable'

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
    OrderTable
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
      isPushingOrder: false,
      pushOrderText: '派单',
      orderCode: '',
      // showOrderTable: false,
      tableHead: ['订单编号', '联系方式', '预约服务时间', '预约服务地点', '车牌', '预约服务类型'],
      tableData: [
        {
          orderId: 'W1702170012811',
          phone: '15951813408',
          time: '2017/3/12 10:00',
          location: '集庆门大街18号',
          license: '苏A12883',
          type: '五座轿车清洗加内饰清洗'
        },
        {
          orderId: 'W1702170012812',
          phone: '15951813408',
          time: '2017/3/12 10:00',
          location: '集庆门大街18号',
          license: '苏A12883',
          type: '五座轿车清洗加内饰清洗'
        }
      ]
    }
  },
  computed: {
    ...mapState([
      'showOrderTable',
      'workerDetail'
    ])
  },
  methods: {
    ...mapActions([
      'getOrderList',
      'sendOrder'
    ]),
    pushOrder () {
      // const root = this
      // this.isPushingOrder = true
      // this.pushOrderText = '派单中……'
      // this.$ajax({
      //   method: 'GET',
      //   url: '/api/app/rest/a/area/city',
      // }).then((res) => {
      //   root.isPushingOrder = false
      //   root.pushOrderText = '派单'
      //   root.snackbarMsg = '派单成功'
      //   root.showSnackbar()
      //   root.topPopup = true
      //   root.getMsg = JSON.stringify(res)
      // }).catch((res) => {
      //   root.isPushingOrder = false
      //   root.pushOrderText = '派单'
      //   root.snackbarMsg = '派单失败'
      //   root.showSnackbar()
      //   root.topPopup = true
      //   root.getMsg = JSON.stringify(res)
      // })
      // this.$store.dispatch('wsSend', this.orderCode)
      const z = this
      const data = {
        orderId: z.orderId,
        workerId: z.infoData.workerId
      }
      z.sendOrder(data)
    },
    toggleOrderTable () {
      const z = this
      // z.$store.commit('toggleOrderTable')
      console.log(z.workerDetail)
      if (z.infoData.todoOrders > 0) {
        z.$store.dispatch('getOrderList', {
          orderStatus: '20',
          workerId: z.workerDetail.workerId
        })
      }
      // if (this.showOrderTable) {
      //   setTimeout(function () {
      //     const offset = window.innerWidth - document.getElementsByClassName('order-table')[0].getBoundingClientRect().right
      //     if (offset < 0) {
      //       z.$store.commit('panBy', {
      //         x: offset - 20,
      //         y: 0
      //       })
      //     }
      //   }, 100)
      // }
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
  top: 228px;
  left: -32px;
  border: 16px solid transparent;
  border-right-color: #fff;
}
/*#infoWindowUI .order-table .mu-table {
  width: auto;
}
#infoWindowUI .order-table div div:first-child .mu-table {
  width: 100%;
}*/
#infoWindowUI .order-table .mu-th,
#infoWindowUI .order-table .mu-td {
  padding: 1em;
  white-space: pre-wrap;
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
</style>

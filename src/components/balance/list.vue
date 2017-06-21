<template>
<div :class="{'drawer-opened': openDrawer}">
  <mainMenu />
  <mu-appbar title="美车师结算汇总信息" class="setting-appbar">
    <div class="setting-dropdown" slot="right">
      <Group :handleChange="changeSelect" />
    </div>
    <div class="setting-dropdown" slot="right">
      <dateSelect :showDate="false" :showMonthAll="false" :handleChange="changeSelect" />
    </div>
    <div class="top-btn" slot="right">
      <mu-raised-button label="导出汇总表" icon="print" class="raised-button" @click="downloadAll" secondary/>
    </div>
  </mu-appbar>
  <mu-table :fixedHeader="true" :showCheckbox="false" class="settle-table" :height="tableHeight">
    <mu-thead slot="header" class="table-header">
      <mu-tr>
        <mu-th v-for="item,index in tableHead" :key="'worker-table-head' + index" :class="'worker-td-'+ index" :title="item">{{item}}</mu-th>
      </mu-tr>
    </mu-thead>
    <mu-tbody>
      <mu-tr v-for="item,index in settlementStatistic" :key="item.workerId" :data-id="item.workerId">
        <mu-td v-for="(value, key, index) in item" :key="key" :class="'worker-td-'+ index" :title="(index > 0) && tableHead[index] + ': ' + value">
          <div :name="key" class="td-text">{{value}}</div>
        </mu-td>
        <mu-td>
          <mu-raised-button label="查看" class="detail-btn" secondary ref="detailBtn" @click="getDetail(item.workerId, item.workerName)" v-if="index + 1 < settlementStatistic.length" />
        </mu-td>
      </mu-tr>
    </mu-tbody>
  </mu-table>
  <Modal :title="modalTitle" :modalTitleBtn="true" modalTitleBtnIcon="print" :modalTitleBtnClick="printWorkerDetail" />
  <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar" />
</div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import mainMenu from '../units/mainMenu'
import Modal from '../Modal'
import Group from '../units/group'
import dateSelect from '../units/dateSelect'
import dropDownMenu from 'muse-components/dropDownMenu'
import {menuItem} from 'muse-components/menu'
import snackbar from 'muse-components/snackbar'
import raisedButton from 'muse-components/raisedButton'

Vue.component(raisedButton.name, raisedButton)
Vue.component(snackbar.name, snackbar)
Vue.component(dropDownMenu.name, dropDownMenu)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'balance-list',
  components: {
    mainMenu,
    Modal,
    Group,
    dateSelect
  },
  data () {
    return {
      selectedWorker: '',
      tableHeight: '',
      tableHead: ['美车师ID', '#', '美车师姓名', '订单费', '订单数量', '用户打赏', '产品费', '服务费用', '美车师结算\n服务费提成', '美车师结算\n奖惩', '美车师结算\n合计', '城市结算\n产品费', '城市结算\n服务费提成', '城市结算\n奖惩', '城市结算\n平台费', '城市结算\n合计', '平台结算\n平台费', '平台结算\n合计', '操作'],
      tableData: [],
      modalTitle: ''
    }
  },
  computed: {
    ...mapState([
      'city',
      'year',
      'month',
      'workers',
      'snackbar',
      'snackbarMsg',
      'bonusPenaltyFinished',
      'settlementStatistic',
      'openDrawer'
    ])
  },
  mounted () {
    this.getData()
    this.tableHeight = 'calc(100vh - 135px)'
    console.table(this.settlementStatistic)
  },
  methods: {
    ...mapMutations([
      'hideSnackbar'
    ]),
    ...mapActions([
      'getSettlementStatistic',
      'downSettlementStatistic',
      'getSettlementByWorker',
      'downSettlementByWorker'
    ]),
    getData () {
      const postData = {
        cityCode: this.city,
        month: this.year + '-' + this.month
      }
      this.getSettlementStatistic(postData)
    },
    changeSelect () {
      this.getData()
    },
    downloadAll () {
      this.downSettlementStatistic({
        cityCode: this.city,
        month: this.year + '-' + this.month
      })
    },
    downloadWorker () {
      this.downSettlementByWorker({
        workerId: this.workerId,
        month: this.year + '-' + this.month,
        workerName: this.workerName
      })
    },
    getDetail: function (workerId, workerName) {
      const z = this
      z.modalTitle = workerName + ' 美车师的结算详情'
      z.workerName = workerName
      z.workerId = workerId
      z.workMonth = this.year + '-' + this.month
      const getData = {
        workerId: z.workerId,
        month: z.workMonth
      }
      z.getSettlementByWorker(getData)
    },
    printWorkerDetail: function () {
      const z = this
      const getData = {
        workerName: z.workerName,
        workerId: z.workerId,
        month: z.workMonth,
        cityCode: z.city
      }
      z.downSettlementByWorker(getData)
    }
  }
}
</script>

<style>
html, body {
  overflow-x: auto;
  overflow-y: hidden; 
}
.setting-appbar.mu-appbar {
  height: 74px;
  padding-left: 100px;
  background-color: #00bcd4;
}
.setting-dropdown {
  line-height: 46px;
  margin-right: 48px;
}
.setting-dropdown label {
  vertical-align: text-bottom;
}
.setting-dropdown .mu-dropDown-menu-text {
  color: #fff;
}
#yearDropDown {
  margin-right: -34px;
}
.settle-table .table-header {
  background-color: #eee;
}
.settle-table .table-header .mu-th {
  padding: 0;
  color: #333;
  border-bottom: 1px solid #c7c7c7;
  text-align: center;
}
.settle-table .mu-th-wrapper {
  white-space: pre-wrap;
}
.settle-table .mu-td {
  font-size: 16px;
  padding: 1em;
  white-space: pre-wrap;
  text-align: center;
  word-wrap: break-word;
  word-break: break-all;
}
.settle-table .detail-btn {
  min-width: 60px;
  line-height: 2;
  height: 2em;
  font-size: 14px;
  margin: 0;
  white-space: normal;
}
.settle-table .worker-td-0 {
  display: none;
}
</style>

<template>
<div :class="{'drawer-opened': openDrawer}">
  <MainMenu title="美车师结算汇总信息"/>
  <div class="toolbox-balance-list">
    <div class="month-select-dropdown">
      <DateSelect :showDate="false" :showMonthAll="false" :handleChange="changeSelect" />
    </div>
    <div class="top-btn">
      <mu-raised-button label="导出汇总表" icon="print" class="raised-button" @click="downloadAll" secondary/>
    </div>
  </div>
  <el-table
    :data="settlementStatistic"
    border
    fit
    highlight-current-row
    :height="tableHeight"
    class="balance-config-table"
  >
    <el-table-column
      type="index"
      fixed="left"
      min-width="60">
    </el-table-column>
    <el-table-column
      prop="workerName"
      fixed="left"
      label="姓名"
      sortable
      min-width="100">
    </el-table-column>
    <el-table-column
      prop="orderFee"
      label="订单费"
      sortable
      min-width="120">
    </el-table-column>
    <el-table-column
      prop="orderNum"
      label="订单数量"
      sortable
      min-width="120">
    </el-table-column>
    <el-table-column
      prop="reward"
      label="用户打赏"
      sortable
      min-width="120">
    </el-table-column>
    <el-table-column
      prop="productFee"
      label="产品费"
      sortable
      min-width="120">
    </el-table-column>
    <el-table-column
      prop="serviceFee"
      label="服务费用"
      sortable
      min-width="120">
    </el-table-column>
    <el-table-column label="美车师结算">
      <el-table-column
        prop="workerServiceFee"
        label="服务费提成"
        sortable
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="workerBonusPenalty"
        label="奖惩"
        sortable
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="workerTotal"
        label="合计"
        sortable
        min-width="120">
      </el-table-column>
    </el-table-column>
    <el-table-column label="城市结算">
      <el-table-column
        prop="cityProductFee"
        label="产品费"
        sortable
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="cityServiceFee"
        label="服务费提成"
        sortable
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="cityBonusPenalty"
        label="奖惩"
        sortable
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="cityPlatformFee"
        label="平台费"
        sortable
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="cityTotal"
        label="合计"
        sortable
        min-width="120">
      </el-table-column>
    </el-table-column>
    <el-table-column label="平台结算">
      <el-table-column
        prop="platformFee"
        label="平台费"
        sortable
        min-width="120">
      </el-table-column>
      <el-table-column
        prop="platformTotal"
        label="合计"
        sortable
        min-width="120">
      </el-table-column>
    </el-table-column>
    <el-table-column
      fixed="right"
      prop="date"
      label="操作"
      min-width="80">
      <template scope="scope">
        <el-button v-if="scope.row.workerId" @click="getDetail(scope.row)" type="primary" size="small">查看</el-button>
      </template>
    </el-table-column>
  </el-table>
  <Modal :title="modalTitle" :modalTitleBtn="true" modalTitleBtnIcon="print" :modalTitleBtnClick="printWorkerDetail" />
  <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar" />
</div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import MainMenu from '../units/mainMenu'
import Modal from '../units/Modal'
import Group from '../units/group'
import DateSelect from '../units/dateSelect'
import { Button, Table, TableColumn } from 'element-ui'
import dropDownMenu from 'muse-components/dropDownMenu'
import {menuItem} from 'muse-components/menu'
import snackbar from 'muse-components/snackbar'
import raisedButton from 'muse-components/raisedButton'

Vue.use(Button)
Vue.use(Table)
Vue.use(TableColumn)
Vue.component(raisedButton.name, raisedButton)
Vue.component(snackbar.name, snackbar)
Vue.component(dropDownMenu.name, dropDownMenu)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'BalanceList',
  components: {
    MainMenu,
    Modal,
    Group,
    DateSelect
  },
  data () {
    return {
      selectedWorker: '',
      tableHeight: 300,
      tableData: [],
      modalTitle: ''
    }
  },
  mounted () {
    this.getData()
    // 监听窗口高度改变，调整表格高度
    const z = this
    function debounce (func, wait) {
      let timer = null
      return function () {
        clearTimeout(timer)
        timer = setTimeout(func, wait)
      }
    }
    function setTableHeight () {
      z.tableHeight = window.innerHeight - 74
    }
    setTableHeight()
    z.funcTableHeight = debounce(setTableHeight, 400)
    window.addEventListener('resize', this.funcTableHeight)
  },
  destroyed () {
    window.removeEventListener('resize', this.funcTableHeight)
  },
  watch: {
    city: function () {
      this.getData()
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
      'settlementStatistic',
      'openDrawer'
    ])
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
    getDetail: function (row) {
      const z = this
      z.modalTitle = row.workerName + ' 美车师的结算详情'
      z.workerName = row.workerName
      z.workerId = row.workerId
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
.toolbox-balance-list .mu-dropDown-menu-text {
  color: #fff;
}
</style>
<style scoped>
.toolbox-balance-list {
  position: absolute;
  top: 0;
  right: 50px;
  color: #fff;
  height: 74px;
  line-height: 74px;
}
.toolbox-balance-list .month-select-dropdown {
  display: inline-block;
}
.toolbox-balance-list .top-btn {
  display: inline-block;
}
</style>

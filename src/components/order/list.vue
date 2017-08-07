<template>
  <div :class="{'drawer-opened': openDrawer}">
    <MainMenu title="订单管理" />
    <div class="toolbox-order-list">
      <div class="search-box">
        <mu-text-field hintText="输入关键字搜索" title="关键字：订单号，用户手机号，美车师姓名，美车师手机号" class="search-input" v-model="searchString" ref="searchField" />
        <mu-icon-button icon="search" class="search-btn" color="#FFF" @click="handleSearch()"/>
      </div>
      <div class="top-btn">
        <mu-raised-button label="导出" icon="print" class="raised-button" @click="exportData" secondary/>
      </div>
    </div>
    <div id="filterBox" class="filterbox-order-list">
      <div>
      <el-select v-model="timeType" @change="filterTimeType" placeholder="时间范围" class="filter-timetype">
        <el-option label="下单时间" value="1"></el-option>
        <el-option label="完成时间" value="2"></el-option>
        <el-option label="支付时间" value="3"></el-option>
      </el-select>
      <el-date-picker
        v-model="timeRange"
        @change="filterTimeRange"
        type="daterange"
        placeholder="选择日期范围"
        class="filter-timerange">
      </el-date-picker>
      </div>
      <el-select v-model="productId" multiple @change="filterProductType" placeholder="服务类型" class="filter-box-div">
        <el-option
          v-for="item in allProductType"
          :key="item.productId"
          :label="item.productName"
          :value="item.productId">
        </el-option>
      </el-select>
      <el-select v-model="orderStatus" multiple @change="filterOrderType" placeholder="订单状态" class="filter-box-div">
        <el-option
          v-for="item in orderStatusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    <el-table :data="orderList.content" border fit highlight-current-row @current-change="handleCurrentChange" :height="tableHeight">
      <el-table-column type="index" fixed="left" width="62">
      </el-table-column>
      <el-table-column prop="orderId" fixed="left" label="订单号" min-width="120">
      </el-table-column>
      <el-table-column prop="productName" label="服务种类" min-width="130">
      </el-table-column>
      <el-table-column prop="userPhone" label="手机号" min-width="130">
      </el-table-column>
      <el-table-column prop="cityCode" :formatter="cityName" label="城市" min-width="90">
      </el-table-column>
      <el-table-column prop="location" label="预约服务地点" min-width="150">
      </el-table-column>
      <el-table-column prop="carInfo" label="车辆信息" min-width="150">
      </el-table-column>
      <el-table-column prop="orderTime" label="下单时间" min-width="120">
      </el-table-column>
      <el-table-column prop="appointTime" label="预约时间" min-width="120">
      </el-table-column>
      <el-table-column prop="workerName" label="美车师姓名" min-width="130">
      </el-table-column>
      <el-table-column prop="phone" label="美车师账号" min-width="130">
      </el-table-column>
      <el-table-column prop="orderStatus" label="订单状态" :formatter="orderStatusName" min-width="150">
      </el-table-column>
      <el-table-column prop="payStatus" label="支付状态" :formatter="payStatusName" min-width="150">
      </el-table-column>
      <el-table-column prop="payID" label="支付ID" min-width="150">
      </el-table-column>
      <el-table-column prop="payTime" label="支付时间" min-width="120">
      </el-table-column>
      <el-table-column prop="saleAmount" label="定价" :formatter="moneyFormatter" min-width="90">
      </el-table-column>
      <el-table-column prop="deductionAmount" label="优惠" :formatter="moneyFormatter" min-width="90">
      </el-table-column>
      <el-table-column prop="payAmount" label="应付金额" :formatter="moneyFormatter" min-width="120">
      </el-table-column>
      <el-table-column prop="realPayAmount" label="实付金额" :formatter="moneyFormatter" min-width="120">
      </el-table-column>
      <el-table-column prop="payName" label="支付方式" min-width="150">
      </el-table-column>
      <el-table-column prop="memo" label="标签" min-width="150">
      </el-table-column>
      <el-table-column prop="remark" label="用户备注" min-width="150">
      </el-table-column>
      <el-table-column fixed="right" prop="date" label="操作" min-width="100">
        <template scope="scope">
          <el-button v-if="selectedId === scope.row.orderId" @click="openDialog" type="danger" size="small">取消订单</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div id="tableFooter">
      <el-pagination
        @size-change="handlePageSizeChange"
        @current-change="handlePageNumberChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 40, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="orderList.totalElements">
      </el-pagination>
    </div>
    <mu-dialog :open="dialog" title="确认取消该订单" @close="closeDialog">
      <span class="dialog-help-text">强行取消该订单可能导致美车师无法正常结算！</span>
      <mu-flat-button slot="actions" @click="closeDialog" primary label="取消" />
      <mu-flat-button slot="actions" primary @click="doDeleteOrder" label="确定" />
    </mu-dialog>
    <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar" />
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import moment from 'moment'
import MainMenu from '../units/mainMenu'
import { Button, Select, Option, Table, TableColumn, Input, Tag, DatePicker, Pagination } from 'element-ui'
import snackbar from 'muse-components/snackbar'
import flatButton from 'muse-components/flatButton'
import dialog from 'muse-components/dialog'
import raisedButton from 'muse-components/raisedButton'

Vue.use(Button)
Vue.use(Select)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Option)
Vue.use(Input)
Vue.use(Tag)
Vue.use(DatePicker)
Vue.use(Pagination)
Vue.component(raisedButton.name, raisedButton)
Vue.component(flatButton.name, flatButton)
Vue.component(dialog.name, dialog)
Vue.component(snackbar.name, snackbar)
export default {
  name: 'ProductList',
  components: {
    MainMenu
  },
  data () {
    return {
      funcTableHeight: {},
      selectedId: '',
      dialog: false,
      tableHeight: 300,
      orderStatusOptions: [{
        value: '10',
        label: '已下单/待接单'
      }, {
        value: '20',
        label: '已接单/待服务'
      }, {
        value: '30',
        label: '服务中'
      }, {
        value: '40',
        label: '服务结束/待支付'
      }, {
        value: '50',
        label: '支付完成/待评价'
      }, {
        value: '60',
        label: '已评价'
      }, {
        value: '90',
        label: '已取消'
      }, {
        value: '91',
        label: '超时取消'
      }],
      orderStatus: [],
      payCode: [],
      productId: [],
      timeType: '1',
      timeRange: [
        moment(),
        moment()
      ],
      searchString: '',
      pageSize: 20,
      currentPage: 1
    }
  },
  mounted () {
    this.adjustTableHeight()
    this.getAllProductType()
    this.getData()
  },
  destroyed () {
    window.removeEventListener('resize', this.funcTableHeight)
  },
  computed: {
    ...mapState([
      'cities',
      'city',
      'group',
      'snackbar',
      'snackbarMsg',
      'openDrawer',
      'allProductType',
      'orderList'
    ]),
    ...mapGetters([
      'cityAndGroup'
    ])
  },
  watch: {
    cityAndGroup: function () {
      this.getData()
    }
  },
  methods: {
    ...mapMutations([
      'showSnackbar',
      'hideSnackbar'
    ]),
    ...mapActions([
      'getAllProductType',
      'getOrdersByCondition',
      'getOrdersByKeyword',
      'cancelOrder'
    ]),
    adjustTableHeight () {
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
        const filterBoxHeight = document.getElementById('filterBox').offsetHeight || 46
        z.tableHeight = window.innerHeight - 74 - filterBoxHeight - 36
      }
      setTableHeight()
      z.funcTableHeight = debounce(setTableHeight, 400)
      window.addEventListener('resize', this.funcTableHeight)
    },
    cityName (row, column, cityCode) {
      let cityName = cityCode
      this.cities.map(c => {
        if (c.cityCode === cityCode) {
          cityName = c.cityName
        }
      })
      return cityName
    },
    moneyFormatter (row, column, money) {
      return (money / 100).toFixed(2)
    },
    orderStatusName (row, column, orderStatus) {
      let name = orderStatus
      this.orderStatusOptions.map(function (o) {
        if (o.value === orderStatus) {
          name = o.label
        }
      })
      return name
    },
    payStatusName (row, column, payStatus) { // 0：待付款，1：已付款
      return payStatus === '1' ? '已付款' : '待付款'
    },
    getData () {
      if (this.searchString) {
        let searchData = {
          keyword: this.searchString.trim(),
          cityCode: this.city,
          leaderId: this.group,
          page: this.currentPage - 1,
          size: this.pageSize
        }
        this.getOrdersByKeyword(searchData)
      } else {
        let data = {
          cityCode: this.city,
          leaderId: this.group,
          payCode: this.payCode.toString(),
          productId: this.productId.toString(),
          orderStatus: this.orderStatus.toString(),
          timeType: this.timeType,
          startTime: moment(this.timeRange[0]).format('YYYY-MM-DD'),
          endTime: moment(this.timeRange[1]).format('YYYY-MM-DD'),
          page: this.currentPage - 1,
          size: this.pageSize
        }
        this.getOrdersByCondition(data)
      }
    },
    openDialog () {
      this.dialog = true
    },
    closeDialog () {
      this.dialog = false
    },
    filterTimeType () {
      this.searchString = ''
      this.getData()
    },
    filterTimeRange () {
      this.searchString = ''
      this.getData()
    },
    filterProductType () {
      this.searchString = ''
      this.getData()
      this.funcTableHeight()
    },
    filterOrderType () {
      this.searchString = ''
      this.getData()
      this.funcTableHeight()
    },
    handleCurrentChange (row, oldRow) {
      this.selectedId = row && row.orderId
    },
    doDeleteOrder () {
      this.cancelOrder({
        orderId: this.selectedId
      })
      this.closeDialog()
    },
    handleSearch () {
      this.getData()
    },
    handlePageSizeChange (size) {
      this.pageSize = size
      this.currentPage = 1
      this.getData()
    },
    handlePageNumberChange (currentPage) {
      this.currentPage = currentPage
      this.getData()
    },
    exportData () {
      console.log(this.orderList.totalElements)
      console.log('export')
    }
  }
}
</script>

<style>
.toolbox-order-list .mu-text-field-input {
  color: #fff;
}
.filterbox-order-list .filter-timetype .el-input__inner {
  border-radius: 4px 0 0 4px;
  border-right: 0;
}
.filterbox-order-list .filter-timerange .el-input__inner {
  border-radius: 0 4px 4px 0;
}
</style>
<style scoped>
.toolbox-order-list {
  position: absolute;
  top: 0;
  right: 30px;
  color: #fff;
  height: 74px;
  line-height: 74px;
}
.toolbox-order-list .search-box {
  position: relative;
  display: inline-block;
}
.toolbox-order-list .search-box .search-input {
  width: 180px;
  margin-top: -2px;
}
.toolbox-order-list .search-box .search-btn {
  position: absolute;
  bottom: 16px;
  right: -8px;
  width: 36px;
  height: 36px;
  padding: 0;
}
.toolbox-order-list .top-btn {
  float: right;
  margin-left: 30px;
  margin-top: 8px;
}
#filterBox {
  display: flex;
  flex-wrap: nowrap;
}
#filterBox .filter-box-div {
  margin: 5px;
  flex: 1;
}
#filterBox .filter-timetype {
  width: 8em;
  margin: 5px -5px 5px 5px;
}
#filterBox .filter-timerange {
  width: 16em;
  margin: 5px 5px 5px 0;
}
#tableFooter {
  text-align: right;
  padding: 2px 5px;
}
</style>

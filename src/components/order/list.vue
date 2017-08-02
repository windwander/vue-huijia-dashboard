<template>
  <div :class="{'drawer-opened': openDrawer}">
    <MainMenu title="订单管理" />
    <div id="filterBox">
      <el-select v-model="value1" placeholder="服务类型" class="filter-box-div">
        <el-option
          v-for="item in productNameOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-select v-model="value2" placeholder="订单状态" class="filter-box-div">
        <el-option
          v-for="item in orderStatusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-select v-model="value3" placeholder="支付方式" class="filter-box-div">
        <el-option
          v-for="item in payNameOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-select v-model="value4" placeholder="时间范围" class="filter-box-div">
        <el-option label="下单时间" value="orderTime"></el-option>
        <el-option label="支付时间" value="payTime"></el-option>
        <el-option label="完成时间" value="finishTime"></el-option>
      </el-select>
      <el-date-picker
        v-model="value5"
        type="daterange"
        placeholder="选择日期范围"
        class="filter-box-div filter-timerange">
      </el-date-picker>
      <el-input
        placeholder="请输入关键字进行查询"
        icon="search"
        v-model="value6"
        :on-icon-click="handleSearch"
        class="filter-box-div">
      </el-input>
    </div>
    <el-table :data="cities" border fit highlight-current-row @current-change="handleCurrentChange" :default-sort="{prop: 'date', order: 'descending'}" :height="tableHeight">
      <el-table-column type="index" fixed="left" min-width="60">
      </el-table-column>
      <el-table-column prop="orderId" fixed="left" label="订单号" sortable min-width="120">
      </el-table-column>
      <el-table-column prop="productName" label="服务种类" sortable min-width="130">
      </el-table-column>
      <el-table-column prop="userPhone" label="手机号" sortable min-width="190">
      </el-table-column>
      <el-table-column prop="cityCode" :formatter="cityName" label="城市" sortable min-width="90">
      </el-table-column>
      <el-table-column prop="location" label="预约服务地点" sortable min-width="120">
      </el-table-column>
      <el-table-column prop="orderTime" label="下单时间" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="orderTime" label="预约时间" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="workerName" label="美车师姓名" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="workerId" label="美车师账号" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="orderStatus" label="订单状态" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="payStatus" label="支付状态" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="payID" label="支付ID" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="payTime" label="支付时间" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="saleAmount" label="定价" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="deductionAmount" label="优惠" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="payAmount" label="应付金额" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="realPayAmount" label="实付金额" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="payName" label="支付方式" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="memo" label="标签" sortable min-width="150">
      </el-table-column>
      <el-table-column prop="cityCode" label="用户备注" sortable min-width="150">
      </el-table-column>
      <el-table-column fixed="right" prop="date" label="操作" min-width="140">
        <template scope="scope">
          <el-button v-if="selectedId === scope.row.workerId" @click="openDialog" type="danger" size="small">取消订单</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div id="tableFooter">
      <el-pagination
        @size-change="handlePageSizeChange"
        @current-change="handlePageNumberChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="20"
        layout="total, sizes, prev, pager, next, jumper"
        :total="400">
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
import { mapState, mapMutations, mapActions } from 'vuex'
import MainMenu from '../units/mainMenu'
import { Button, Select, Option, Table, TableColumn, Input, Tag, DatePicker, Pagination } from 'element-ui'
import snackbar from 'muse-components/snackbar'
import flatButton from 'muse-components/flatButton'
import dialog from 'muse-components/dialog'

Vue.use(Button)
Vue.use(Select)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Option)
Vue.use(Input)
Vue.use(Tag)
Vue.use(DatePicker)
Vue.use(Pagination)
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
      selectedId: '',
      dialog: false,
      tableHeight: 300,
      productNameOptions: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      orderStatusOptions: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      payNameOptions: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      value1: '',
      value2: '',
      value3: '',
      value4: '',
      value5: '',
      value6: '',
      currentPage: 1
    }
  },
  mounted () {
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
      z.tableHeight = window.innerHeight - 74 - 46 - 36
    }
    setTableHeight()
    z.funcTableHeight = debounce(setTableHeight, 400)
    window.addEventListener('resize', this.funcTableHeight)
  },
  destroyed () {
    window.removeEventListener('resize', this.funcTableHeight)
  },
  computed: {
    ...mapState([
      'cities',
      'snackbar',
      'snackbarMsg',
      'openDrawer'
    ])
  },
  watch: {
  },
  methods: {
    ...mapMutations([
      'showSnackbar',
      'hideSnackbar'
    ]),
    ...mapActions([
    ]),
    cityName (row, column, cityCode) {
      let cityName = cityCode
      this.cities.map(c => {
        if (c.cityCode === cityCode) {
          cityName = c.cityName
        }
      })
      return cityName
    },
    openDialog () {
      this.dialog = true
    },
    closeDialog () {
      this.dialog = false
    },
    handleCurrentChange (row, oldRow) {
      console.log(row)
    },
    doDeleteOrder () {
    },
    handleSearch () {
      console.log(this.value6)
    },
    handlePageSizeChange () {},
    handlePageNumberChange () {}
  }
}
</script>

<style scoped>
#filterBox {
  display: flex;
  flex-wrap: nowrap;
}
#filterBox .filter-box-div {
  margin: 5px;
  flex: 1;
}
#filterBox .filter-timerange {
  flex-grow: 2;
}
#tableFooter {
  text-align: right;
  padding: 2px 5px;
}
</style>

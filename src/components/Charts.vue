<template>
  <div>
    <mainMenu />
    <mu-appbar title="运营图表" class="setting-appbar">
      <div class="setting-dropdown" slot="right">
        <label for="cityDropDown">城市：</label>
        <mu-dropDown-menu v-if="cities.length" :value="city" @change="handleChangeCity" id="cityDropDown">
          <mu-menu-item v-for="item in cities" :key="item.cityId" :value="item.cityId" :title="item.cityName" />
        </mu-dropDown-menu>
      </div>
      <div class="setting-dropdown" slot="right">
        <label for="monthDropDown">时间范围：</label>
        <mu-dropDown-menu :value="year" @change="handleChangeYear" id="yearDropDown">
          <mu-menu-item value="2017" title="2017年" />
          <mu-menu-item value="2018" title="2018年" />
          <mu-menu-item value="2019" title="2019年" />
          <mu-menu-item value="2020" title="2020年" />
          <mu-menu-item value="2020" title="2021年" />
          <mu-menu-item value="2020" title="2022年" />
        </mu-dropDown-menu>
        <mu-dropDown-menu :value="month" @change="handleChangeMonth" id="monthDropDown">
          <mu-menu-item value="0" title="全年" />
          <mu-menu-item v-for="n in 12" :key="n" :value="n < 10 ? ('0' + n) : n" :title="n + '月'" />
        </mu-dropDown-menu>
      </div>
      <!--<div class="top-btn" slot="right">
        <mu-raised-button label="结算问题修复" icon="build" class="raised-button" @click="topBtnBuild" primary/>
        <mu-raised-button label="导出汇总表" icon="print" class="raised-button" @click="downloadAll" secondary/>
      </div>-->
    </mu-appbar>
    <ECharts :options="chartOption" auto-resize/>
    <!--<Modal :title="modalTitle" :modalTitleBtn="true" modalTitleBtnIcon="print" :modalTitleBtnClick="printWorkerDetail" />
    <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar" />-->
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import mainMenu from './units/mainMenu'
import Modal from './Modal'
import dropDownMenu from 'muse-components/dropDownMenu'
import {menuItem} from 'muse-components/menu'
import snackbar from 'muse-components/snackbar'
import raisedButton from 'muse-components/raisedButton'
import ECharts from 'vue-echarts/components/ECharts.vue'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'

// Vue.component(raisedButton.name, raisedButton)
Vue.component(raisedButton.name, raisedButton)
Vue.component(snackbar.name, snackbar)
Vue.component(dropDownMenu.name, dropDownMenu)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'Charts',
  components: {
    mainMenu,
    Modal,
    ECharts
  },
  data () {
    const dateYear = new Date().getFullYear().toString()
    const dateMonth = new Date().getMonth() + 1
    return {
      selectedWorker: '',
      city: 320100,
      year: dateYear,
      month: dateMonth < 10 ? ('0' + dateMonth) : dateMonth,
      timeScope: 'month',
      tableHeight: '',
      tableHead: ['美车师ID', '美车师姓名', '订单费', '订单数量', '用户打赏', '产品费', '服务费用', '美车师结算\n服务费提成', '美车师结算\n奖惩', '美车师结算\n合计', '城市结算\n产品费', '城市结算\n服务费提成', '城市结算\n奖惩', '城市结算\n平台费', '城市结算\n合计', '平台结算\n平台费', '平台结算\n合计', '操作'],
      tableData: [],
      modalTitle: '',
      chartOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['完成单量', '目标单量', '环比增长率', '目标达成率']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: (function () {
            let arr = []
            for (let i = 1; i <= 31; i++) {
              arr.push(i)
            }
            return arr
          })()
        }],
        yAxis: [{
          type: 'value',
          name: '单量'
        }, {
          type: 'value',
          name: '比率',
          // min: 0,
          // max: 25,
          // interval: 5,
          axisLabel: {
            formatter: '{value} %'
          }
        }],
        series: [{
          name: '完成单量',
          type: 'bar',
          stack: '单量',
          data: (function () {
            let arr = []
            for (let i = 1; i <= 31; i++) {
              arr.push(Math.floor(Math.random() * 80))
            }
            return arr
          })()
        }, {
          name: '目标单量',
          type: 'bar',
          stack: '单量',
          data: (function () {
            let arr = []
            for (let i = 1; i <= 31; i++) {
              arr.push(Math.floor(Math.random() * 20))
            }
            return arr
          })()
        }, {
          name: '环比增长率',
          type: 'line',
          yAxisIndex: 1,
          data: (function () {
            let arr = []
            for (let i = 1; i <= 31; i++) {
              arr.push(Math.floor(Math.random() * 100))
            }
            return arr
          })(),
          formatter: '{value} %'
        }, {
          name: '目标达成率',
          type: 'line',
          yAxisIndex: 1,
          data: (function () {
            let arr = []
            for (let i = 1; i <= 31; i++) {
              arr.push(Math.floor(Math.random() * 100))
            }
            return arr
          })(),
          formatter: '{value} %'
        }]
      }
    }
  },
  computed: {
    ...mapState([
      'cities',
      'workers',
      'snackbar',
      'snackbarMsg',
      'bonusPenaltyFinished',
      'settlementStatistic'
    ])
  },
  mounted () {
    this.getCities()
    this.getData()
    this.tableHeight = 'calc(100vh - 135px)'
  },
  methods: {
    ...mapMutations([
      'hideSnackbar'
    ]),
    ...mapActions([
      'getSettlementStatistic',
      'downSettlementStatistic',
      'getSettlementByWorker',
      'downSettlementByWorker',
      'solveSettleProblem',
      'getCities'
    ]),
    getData () {
      // const postData = {
      //   cityCode: this.city,
      //   month: this.year + '-' + this.month
      // }
      // this.getSettlementStatistic(postData)
    },
    handleChangeCity (value) {
      this.city = value
    },
    handleChangeYear (value) {
      this.year = value
    },
    handleChangeMonth (value) {
      this.month = value
    },
    handleChangeScope (value) {
      this.timeScope = value
    }
  }
}
</script>

<style>
html,
body {
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
/*
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

.modal-popup {
  width: 1200px;
  max-width: 1200px;
}

.modal-popup {
  width: 1200px;
  max-width: 1200px;
}*/
#app .echarts {
  width: 100vw;
  height: 500px;
}
</style>

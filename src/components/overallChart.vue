<template>
  <div>
    <mainMenu />
    <mu-appbar title="运营整体趋势" class="setting-appbar">
      <div class="setting-dropdown" slot="right">
        <Group :handleChange="changeGroup" />
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
        <label for="serviceDropDown">服务种类：</label>
        <mu-dropDown-menu :value="service" @change="handleChangeService" id="serviceDropDown">
          <mu-menu-item value="0" title="全部" />
          <mu-menu-item v-for="item in services" :key="item.serviceId" :value="item.serviceId" :title="item.serviceName" />
        </mu-dropDown-menu>
      </div>
    </mu-appbar>
    <div id="orderTypeBox">
      <status-box v-for="item in services" :key="item.serviceId" :number="item.serviceId * 98765" :title="item.serviceName" direction="row" clickable="clickable" @click="chooseType(item.serviceName)" />
    </div>
    <ECharts :options="chartOption" auto-resize ref="bar"/>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import mainMenu from './units/mainMenu'
import Modal from './Modal'
import Group from './units/group'
import statusBox from './units/statusBox'
import dropDownMenu from 'muse-components/dropDownMenu'
import {menuItem} from 'muse-components/menu'
import snackbar from 'muse-components/snackbar'
import ECharts from 'vue-echarts/components/ECharts.vue'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'

Vue.component(snackbar.name, snackbar)
Vue.component(dropDownMenu.name, dropDownMenu)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'Charts',
  components: {
    mainMenu,
    statusBox,
    Modal,
    ECharts,
    Group
  },
  data () {
    const dateYear = new Date().getFullYear().toString()
    const dateMonth = new Date().getMonth() + 1
    const services = ['上门洗车', '清洗机舱', '加玻璃水', '内饰精洗', '轮胎补气', '水晶打蜡', '高亮打蜡', '玻璃镀膜', '3M空调清洗', '好顺空调清洗', '轮毂清洗', '加冷却液']
    return {
      selectedWorker: '',
      year: dateYear,
      month: dateMonth < 10 ? ('0' + dateMonth) : dateMonth,
      timeScope: 'month',
      services: services.map((item, index) => {
        return {
          serviceId: index + 1,
          serviceName: item
        }
      }),
      service: 1,
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
          data: ['环比增长率', '目标达成率'].concat(services)
        },
        toolbox: {
          orient: 'vertical',
          itemSize: 24,
          right: 24,
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
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
        //   name: '完成单量',
        //   type: 'bar',
        //   stack: '完成单量',
        //   data: (function () {
        //     let arr = []
        //     for (let i = 1; i <= 31; i++) {
        //       arr.push(Math.floor(Math.random() * 80))
        //     }
        //     return arr
        //   })()
        // }, {
        //   name: '目标单量',
        //   type: 'bar',
        //   stack: '目标单量',
        //   data: (function () {
        //     let arr = []
        //     for (let i = 1; i <= 31; i++) {
        //       arr.push(Math.floor(Math.random() * 20))
        //     }
        //     return arr
        //   })()
        // }, {
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
        }].concat(services.map(item => {
          return {
            name: item,
            type: 'line',
            areaStyle: {normal: {}},
            stack: '完成单量',
            data: (function () {
              let arr = []
              for (let i = 1; i <= 31; i++) {
                arr.push(Math.floor(Math.random() * 80))
              }
              return arr
            })()
          }
        // })).concat(services.map(item => {
        //   return {
        //     name: item.serviceName,
        //     type: 'bar',
        //     stack: '目标单量',
        //     data: (function () {
        //       let arr = []
        //       for (let i = 1; i <= 31; i++) {
        //         arr.push(Math.floor(Math.random() * 80))
        //       }
        //       return arr
        //     })()
        //   }
        }))
      }
    }
  },
  computed: {
    ...mapState([
      'city',
      'workers',
      'snackbar',
      'snackbarMsg',
      'bonusPenaltyFinished',
      'settlementStatistic'
    ])
  },
  mounted () {
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
      'solveSettleProblem'
    ]),
    getData () {
      // const postData = {
      //   cityCode: this.city,
      //   month: this.year + '-' + this.month
      // }
      // this.getSettlementStatistic(postData)
    },
    changeGroup () {
      this.getData()
    },
    handleChangeService (value) {
      this.service = value
    },
    handleChangeYear (value) {
      this.year = value
    },
    handleChangeMonth (value) {
      this.month = value
      let bar = this.$refs.bar
      let newData = {
        series: [{
          data: (function () {
            let arr = []
            for (let i = 1; i <= 31; i++) {
              arr.push(Math.floor(Math.random() * 80))
            }
            return arr
          })()
        }, {
          data: (function () {
            let arr = []
            for (let i = 1; i <= 31; i++) {
              arr.push(Math.floor(Math.random() * 20))
            }
            return arr
          })()
        }, {
          data: (function () {
            let arr = []
            for (let i = 1; i <= 31; i++) {
              arr.push(Math.floor(Math.random() * 100))
            }
            return arr
          })()
        }, {
          data: (function () {
            let arr = []
            for (let i = 1; i <= 31; i++) {
              arr.push(Math.floor(Math.random() * 100))
            }
            return arr
          })()
        }]
      }
      bar.mergeOptions(newData)
    },
    handleChangeScope (value) {
      this.timeScope = value
    },
    chooseType (name) {
      console.log(name)
      let bar = this.$refs.bar
      this.services.map(s => {
        bar.dispatchAction({
          type: 'legendUnSelect',
          name: s.serviceName
        })
      })
      bar.dispatchAction({
        type: 'legendSelect',
        name: name
      })
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
#orderTypeBox {
  display: flex;
  width: 60%;
  margin: 24px auto;
  flex-wrap: wrap;
}
#orderTypeBox .status-box {
  margin: 6px 12px;
}
#orderTypeBox .status-box .status-button {
  height: 108px;
  width: 120px;
}
#orderTypeBox .status-box .head-status-number {
  font-size: 24px;
}
#orderTypeBox .status-box .mu-flat-button-label {
  font-size: 18px;
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
#app div.echarts {
  width: 90vw;
  height: 500px;
}
</style>

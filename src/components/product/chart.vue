<template>
  <div :class="{'drawer-opened': openDrawer}">
    <MainMenu title="产品数据分析" />
    <mu-tabs :value="activeTab" @change="handleTabChange" class="chart-tabs">
      <mu-tab value="hour" icon="schedule" title="实时统计"/>
      <mu-tab value="day" icon="assessment" title="整体趋势"/>
    </mu-tabs>
    <div id="mainContent">
      <div id="orderTypeBox">
        <StatusBox
          :number="(function () {
            let total = 0
            generalOrderStatistics.map(item => {
              total += item.completionNum
            })
            return total
          })()"
        title="全部服务" direction="row" clickable="clickable" @click="chooseType('', '全部服务')" :selected="'' === categoryData.code ? 'selected' : ''" />
        <StatusBox v-for="item in generalOrderStatistics" :key="item.categoryCode" :number="item.completionNum" :title="item.categoryName" direction="row" clickable="clickable" @click="chooseType(item.categoryCode, item.categoryName)" :selected="item.categoryCode === categoryData.code ? 'selected' : ''" />
      </div>
      <div class="chart-box">
        <div v-if="activeTab === 'hour'" class="toolbox">
          <mu-raised-button icon="date_range" label="增加对比日期" @click="addCompareBtn"/>
          <mu-date-picker :maxDate="today" mode="landscape" hintText="增加对比" okLabel="确认加入对比" @change="addCompare" class="date-picker-input" ref="selectDateInput"/>
        </div>
        <div v-if="activeTab === 'day'" class="toolbox">
          <mu-raised-button label="周" @click="changePeriod('week')" class="toolbox-btn" :class="{'active': periodType === 'week'}" />
          <mu-raised-button label="月" @click="changePeriod('month')" class="toolbox-btn" :class="{'active': periodType === 'month'}"/>
          <mu-raised-button label="自定义" @click="triggerSetDate" class="toolbox-btn"  :class="{'active': periodType === 'custom'}"/>
          <mu-date-picker :maxDate="today" mode="landscape" v-model="startDate" hintText="起始日期" @change="setStartDate" okLabel="确认起始日期" class="date-picker-input" ref="startDateInput"/>
          <mu-date-picker :minDate="startDate" :maxDate="today" mode="landscape" v-model="endDate" hintText="结束日期" @change="setEndDate" okLabel="确认结束日期" class="date-picker-input" ref="endDateInput"/>
        </div>
        <ECharts :options="chartOption" auto-resize ref="chart"/>
      </div>
    </div>
    <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar"/>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import moment from 'moment'
import MainMenu from '../units/mainMenu'
import StatusBox from '../units/statusBox'
import dropDownMenu from 'muse-components/dropDownMenu'
import raisedButton from 'muse-components/raisedButton'
import {menuItem} from 'muse-components/menu'
import {tab, tabs} from 'muse-components/tabs'
import snackbar from 'muse-components/snackbar'
import datePicker from 'muse-components/datePicker'
import ECharts from 'vue-echarts/components/ECharts.vue'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'

Vue.component(snackbar.name, snackbar)
Vue.component(dropDownMenu.name, dropDownMenu)
Vue.component(raisedButton.name, raisedButton)
Vue.component(menuItem.name, menuItem)
Vue.component(tabs.name, tabs)
Vue.component(tab.name, tab)
Vue.component(datePicker.name, datePicker)
export default {
  name: 'ProductChart',
  components: {
    MainMenu,
    StatusBox,
    ECharts
  },
  data () {
    return {
      selectedWorker: '',
      activeTab: 'hour',
      startDate: '',
      endDate: '',
      periodType: 'week',
      today: moment().format('YYYY-MM-DD'),
      chartOption: {},
      legendHour: [],
      seriesHour: [],
      compareHourDates: new Set(),
      categoryData: {
        code: '',
        name: '全部服务'
      }
    }
  },
  created () {
    const data = {
      cityCode: this.city,
      startDate: this.today,
      endDate: this.today,
      parentId: this.group
    }
    this.getGeneralOrderStatistics(data)
  },
  mounted () {
    let chart = this.$refs.chart
    chart.showLoading({
      text: '加载中',
      color: '#c23531',
      textColor: '#000',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0
    })
    this.initHourChart()
    this.getData(this.today, true)
  },
  computed: {
    ...mapState([
      'city',
      'group',
      'snackbar',
      'snackbarMsg',
      'generalOrderStatistics',
      'operationTrendData',
      'openDrawer'
    ]),
    ...mapGetters([
      'cityAndGroup'
    ]),
    completionNum: function () {
      let arr
      if (this.operationTrendData) {
        arr = this.operationTrendData.map(d => d.completionNum)
      }
      return arr
    },
    dimension: function () {
      let z = this
      let arr
      if (z.operationTrendData) {
        arr = z.operationTrendData.map(d => {
          if (z.activeTab === 'hour') {
            return d.dimension + '时'
          } else {
            return d.dimension
          }
        })
      }
      return arr
    }
  },
  watch: {
    cityAndGroup: function () {
      const z = this
      if (z.activeTab === 'hour') {
        z.initHourChart()
        z.getData()
      } else if (z.activeTab === 'day') {
        z.getData()
      }
    },
    openDrawer: function () {
      const z = this
      setTimeout(function () {
        z.$refs.chart.resize()
      }, 500)
    }
  },
  methods: {
    ...mapMutations([
      'hideSnackbar'
    ]),
    ...mapActions([
      'getGeneralOrderStatistics',
      'getOperationTrendDate',
      'getOperationTrendFromStartToEnd'
    ]),
    formatDate (type) {
      const z = this
      if (type === 'week') {
        z.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD')
        z.endDate = moment().format('YYYY-MM-DD')
      } else if (type === 'month') {
        z.startDate = moment().subtract(30, 'days').format('YYYY-MM-DD')
        z.endDate = moment().format('YYYY-MM-DD')
      }
    },
    getData (date, noUpdateStatistics) {
      const z = this
      const data = {
        cityCode: z.city,
        date: date || z.today,
        startDate: z.startDate || z.today,
        endDate: z.endDate || z.today,
        parentId: z.group,
        categoryCode: z.categoryData.code
      }
      if (!noUpdateStatistics) {
        z.getGeneralOrderStatistics(data)
      }
      if (z.activeTab === 'hour') {
        z.getOperationTrendDate(data).then(function () {
          z.updateHourChart(data.date)
        })
      } else if (z.activeTab === 'day') {
        z.getOperationTrendFromStartToEnd(data).then(function () {
          z.updateDayChart()
        })
      }
    },
    chooseType (categoryCode, name) {
      this.categoryData = {
        code: categoryCode,
        name: name
      }
      const z = this
      if (z.activeTab === 'hour') {
        z.initHourChart()
        z.getData()
      } else if (z.activeTab === 'day') {
        z.getData()
      }
    },
    changePeriod (type) {
      this.periodType = type
      this.formatDate(type)
      this.getData()
    },
    triggerSetDate () {
      this.periodType = 'custom'
      this.startDate = ''
      this.endDate = ''
      this.$refs.startDateInput.openDialog()
    },
    setStartDate (v) {
      this.startDate = v
      this.$refs.endDateInput.openDialog()
    },
    setEndDate (v) {
      this.endDate = v
      this.getData()
    },
    handleTabChange (v) {
      let z = this
      z.activeTab = v
      if (v === 'hour') {
        z.initHourChart()
        z.periodType = 'week'
        z.startDate = ''
        z.endDate = ''
      } else if (v === 'day') {
        z.updateDayChart()
        z.formatDate('week')
      }
      z.getData()
    },
    addCompareBtn () {
      this.$refs.selectDateInput.openDialog()
    },
    addCompare (date) {
      if (!this.compareHourDates.has(date)) {
        this.compareHourDates.add(date)
        this.getData(date, true)
      }
    },
    initHourChart () {
      this.legendHour = []
      this.seriesHour = []
      this.compareHourDates.clear()
      this.compareHourDates.add(this.today)
      this.chartOption = {
        title: {
          show: true,
          text: '产品单量趋势图',
          top: 'top',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          top: '12%',
          data: []
        },
        toolbox: {
          orient: 'horizontal',
          itemSize: 24,
          itemGap: 24,
          right: 24,
          top: 12,
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          top: '24%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: true,
          data: []
        }],
        yAxis: [{
          type: 'value',
          name: '单量'
        }],
        series: []
      }
    },
    updateHourChart (date) {
      const z = this
      let chart = z.$refs.chart
      z.legendHour.push({
        name: date === z.today ? '今日' : date
      })
      z.seriesHour.push({
        name: date === z.today ? '今日' : date,
        type: 'line',
        data: z.completionNum
      })
      chart.mergeOptions({
        legend: {
          data: z.legendHour
        },
        xAxis: [{
          data: z.dimension
        }],
        series: z.seriesHour
      })
      chart.hideLoading()
    },
    updateDayChart () {
      this.chartOption = {
        title: {
          show: true,
          text: '产品单量趋势图',
          top: 'top',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        // legend: {
        //   top: '12%',
        //   data: []
        // },
        toolbox: {
          orient: 'vertical',
          itemSize: 24,
          right: 24,
          top: 12,
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          top: '24%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: true,
          data: this.dimension
        }],
        yAxis: [{
          type: 'value',
          name: '单量'
        }],
        series: [{
          name: '完成单量',
          type: 'line',
          data: this.completionNum
        }]
      }
    }
  }
}
</script>

<style>
#orderTypeBox .status-box:first-child .status-button {
  height: 228px;
  width: 120px;
}
#orderTypeBox .status-box .status-button {
  height: 108px;
  width: 120px;
}
#orderTypeBox .status-box.selected .status-button {
  background-color: #fffde7 !important;
}
#orderTypeBox .status-box .head-status-number {
  font-size: 24px;
}
#orderTypeBox .status-box .mu-flat-button-label {
  font-size: 18px;
}
</style>
<style scoped>
#mainContent {
  height: calc(100vh - 75px);
  overflow: auto;
  padding-top: 10px;
}
#orderTypeBox {
  display: flex;
  height: 240px;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  align-content: center;
}
#orderTypeBox .status-box {
  margin: 6px 12px;
}
#mainContent .chart-box {
  position: relative;
  height: 100%;
}
.chart-tabs {
  position: absolute;
  top: 0;
  left: 50%;
  width: 240px;
  height: 74px;
  margin-left: -120px;
  background-color: transparent;
  transition: all .45s cubic-bezier(.23,1,.32,1);
}
.drawer-opened .chart-tabs {
  margin-left: 8px;
}
.echarts {
  width: 100%;
  min-height: 420px;
  height: 100%;
}
.toolbox {
  position: absolute;
  top: 14px;
  left: 80px;
  z-index: 10;
}
.toolbox-btn {
  min-width: auto;
}
.toolbox-btn.active {
  background-color: rgba(71, 74, 79, 0.1);
}
.date-picker-input {
  display: none;
}
</style>

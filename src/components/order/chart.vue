<template>
  <div :class="{'drawer-opened': openDrawer}">
    <MainMenu title="订单数据分析" />
    <mu-tabs :value="activeTab" @change="handleTabChange" class="chart-tabs">
      <mu-tab value="hour" icon="schedule" title="实时统计"/>
      <mu-tab value="day" icon="assessment" title="整体趋势"/>
    </mu-tabs>
    <div id="mainContent">
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
  name: 'OrderChart',
  components: {
    MainMenu,
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
      compareHourDates: new Set()
    }
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
    this.getData()
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
    getData (date) {
      const z = this
      const data = {
        cityCode: z.city,
        date: date || z.today,
        startDate: z.startDate,
        endDate: z.endDate,
        parentId: z.group,
        categoryCode: ''
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
        this.getData(date)
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
          text: '订单完成量趋势图',
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
          text: '订单完成量趋势图',
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

<style scoped>
#mainContent {
  height: calc(100vh - 75px);
  overflow: auto;
  padding-top: 10px;
}
#mainContent .chart-box {
  position: relative;
  height: 100%;
  width: 100%;
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

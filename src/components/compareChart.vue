<template>
  <div>
    <mainMenu />
    <mu-appbar title="运营数据对比" class="setting-appbar">
      <div class="setting-dropdown" slot="right">
        <Group :handleChange="changeSelect" />
      </div>
      <div class="setting-dropdown" slot="right">
        <!--<label for="monthDropDown">时间范围：</label>-->
        <dateSelect :handleChange="changeSelect" />
      </div>
      <div class="setting-dropdown" slot="right">
        <mu-dropDown-menu :value="categoryData.code" @change="handleChangeService" :maxHeight="480" id="serviceDropDown">
          <mu-menu-item value="" title="全部服务" />
          <mu-menu-item v-for="item in generalOrderStatistics" :key="item.categoryCode" :value="item.categoryCode" :title="item.categoryName" />
        </mu-dropDown-menu>
      </div>
      <div class="top-btn" slot="right">
        <mu-raised-button label="统计运营数据" icon="trending_up" class="raised-button" @click="topBtnCalc" secondary/>
      </div>
    </mu-appbar>
    <div id="mainContent">
      <ECharts :options="chartOption" auto-resize ref="bar"/>
    </div>
    <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar"/>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import mainMenu from './units/mainMenu'
import Modal from './Modal'
import Group from './units/group'
import dateSelect from './units/dateSelect'
import dropDownMenu from 'muse-components/dropDownMenu'
import {menuItem} from 'muse-components/menu'
import snackbar from 'muse-components/snackbar'
import ECharts from 'vue-echarts/components/ECharts.vue'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/title'
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
    Modal,
    ECharts,
    Group,
    dateSelect
  },
  data () {
    return {
      selectedWorker: '',
      categoryData: {
        code: '',
        name: '全部服务'
      },
      chartOption: {
        title: {
          show: true,
          text: '运营对比图',
          subtext: this.fullDate,
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
          top: '12%'
        },
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
          boundaryGap: true
        }],
        yAxis: [{
          type: 'value',
          name: '单量'
        }],
        series: []
      }
    }
  },
  computed: {
    ...mapState([
      'city',
      'group',
      'snackbar',
      'snackbarMsg',
      'generalOrderStatistics',
      'operationTrendCity'
    ]),
    ...mapGetters([
      'fullDate'
    ]),
    targetNum: function () {
      let arr
      if (this.operationTrendCity) {
        arr = this.operationTrendCity.map(d => d.targetNum)
      }
      return arr
    },
    completionNum: function () {
      let arr
      if (this.operationTrendCity) {
        arr = this.operationTrendCity.map(d => d.completionNum)
      }
      return arr
    },
    achievingRate: function () {
      let arr
      if (this.operationTrendCity) {
        arr = this.operationTrendCity.map(d => d.achievingRate)
      }
      return arr
    },
    linkGrowthRate: function () {
      let arr
      if (this.operationTrendCity) {
        arr = this.operationTrendCity.map(d => d.linkGrowthRate)
      }
      return arr
    },
    dimension: function () {
      let arr
      if (this.operationTrendCity) {
        arr = this.operationTrendCity.map(d => d.cityName)
      }
      return arr
    }
  },
  mounted () {
    let bar = this.$refs.bar
    bar.showLoading({
      text: '加载中',
      color: '#c23531',
      textColor: '#000',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0
    })
    const dataA = {
      cityCode: this.city,
      date: this.fullDate,
      parentId: this.group
    }
    this.getGeneralOrderStatistics(dataA)
    this.getData()
  },
  methods: {
    ...mapMutations([
      'hideSnackbar'
    ]),
    ...mapActions([
      'getGeneralOrderStatistics',
      'getOperationTrendCity',
      'statisticsOperationData'
    ]),
    getData () {
      const z = this
      const data = {
        cityCode: this.city,
        date: this.fullDate,
        parentId: this.group,
        categoryCode: this.categoryData.code
      }
      this.getOperationTrendCity(data)
      setTimeout(function () {
        z.updateBar()
      }, 100)
    },
    handleChangeService (v) {
      let name = '全部服务'
      if (v !== '') {
        name = this.generalOrderStatistics.filter(t => t.categoryCode === v)[0].categoryName
      }
      this.categoryData = {
        code: v,
        name: name
      }
      this.changeSelect()
    },
    changeSelect () {
      this.getData()
    },
    updateBar () {
      const z = this
      let bar = z.$refs.bar
      let lengend = []
      let series = []
      if (z.targetNum && z.targetNum[0] !== null) {
        lengend.push('目标单量')
        series.push({
          name: '目标单量',
          type: 'bar',
          // stack: '单量',
          areaStyle: {normal: {}},
          // itemStyle: {
          //   normal: {
          //     color: '#26c6da'
          //   },
          //   emphasis: {
          //     color: '#80deea'
          //   }
          // },
          data: z.targetNum
        })
      }
      if (z.completionNum && z.completionNum[0] !== null) {
        lengend.push('完成单量')
        series.push({
          name: '完成单量',
          type: 'bar',
          // stack: '单量',
          areaStyle: {normal: {}},
          // itemStyle: {
          //   normal: {
          //     color: '#66bb6a'
          //   },
          //   emphasis: {
          //     color: '#a5d6a7'
          //   }
          // },
          data: z.completionNum
        })
      }
      let newData = {
        title: {
          text: z.categoryData.name + '-运营对比图',
          subtext: this.fullDate
        },
        legend: {
          data: lengend
        },
        xAxis: [{
          data: z.dimension
          // name: '时'
          // nameLocation: 'end',
          // nameGap: -15,
          // nameRotate: 0
        }],
        series: series
      }
      bar.mergeOptions(newData)
      bar.hideLoading()
    },
    topBtnCalc () {
      this.statisticsOperationData()
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
#mainContent {
  height: calc(100vh - 75px);
  overflow: auto;
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
#app div.echarts {
  width: 100%;
  min-height: 500px;
  height: 100%;
}
#yearDropDown, #monthDropDown {
  margin-right: -34px;
}
</style>

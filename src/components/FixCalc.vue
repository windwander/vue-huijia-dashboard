<template>
<div>
  <mainMenu />
  <mu-appbar title="美车师结算下载" class="setting-appbar">
    <div class="setting-dropdown" slot="right">
      <label for="cityDropDown">城市：</label>
      <mu-dropDown-menu v-if="cities.length" :value="city" @change="handleChangeCity" id="cityDropDown">
        <mu-menu-item v-for="item in cities" :key="item.cityId" :value="item.cityId" :title="item.cityName"/>
      </mu-dropDown-menu>
    </div>
    <div class="setting-dropdown" slot="right">
      <label for="monthDropDown">月份：</label>
      <mu-dropDown-menu :value="year" @change="handleChangeYear" id="yearDropDown">
        <mu-menu-item value="2017" title="2017年" />
        <mu-menu-item value="2018" title="2018年" />
        <mu-menu-item value="2019" title="2019年" />
        <mu-menu-item value="2020" title="2020年" />
        <mu-menu-item value="2020" title="2021年" />
        <mu-menu-item value="2020" title="2022年" />
      </mu-dropDown-menu>
      <mu-dropDown-menu :value="month" @change="handleChangeMonth" id="monthDropDown">
        <mu-menu-item v-for="n in 12" :key="n" :value="n < 10 ? ('0' + n) : n" :title="n + '月'" />
      </mu-dropDown-menu>
    </div>
    <div class="top-btn" slot="right">
      <mu-raised-button label="结算问题修复" icon="build" class="raised-button" @click="topBtnBuild" primary/>
      <mu-raised-button label="导出结算汇总表" icon="print" class="raised-button" @click="downloadAll" secondary/>
    </div>
  </mu-appbar>
  <div class="worker-form">
    <mu-text-field label="美车师ID（必填）" v-model="workerId" labelFloat/><br/>
    <mu-text-field label="美车师姓名（选填，作为文件名）" v-model="workerName" labelFloat/><br/>
    <mu-raised-button label="导出该美车师结算汇总表" icon="print" class="raised-button" @click="downloadWorker" secondary/>
  </div>
  <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar"/>
</div>
</template>
<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import mainMenu from './units/mainMenu'
import dropDownMenu from 'muse-components/dropDownMenu'
import {menuItem} from 'muse-components/menu'
import snackbar from 'muse-components/snackbar'
import raisedButton from 'muse-components/raisedButton'

Vue.component(raisedButton.name, raisedButton)
Vue.component(snackbar.name, snackbar)
Vue.component(dropDownMenu.name, dropDownMenu)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'FixCalc',
  components: {
    mainMenu
  },
  data () {
    const dateYear = new Date().getFullYear().toString()
    const dateMonth = new Date().getMonth() + 1
    return {
      city: 320100,
      year: dateYear,
      month: dateMonth < 10 ? ('0' + dateMonth) : dateMonth,
      workerId: '',
      workerName: ''
    }
  },
  computed: {
    ...mapState([
      'cities',
      'snackbar',
      'snackbarMsg'
    ])
  },
  mounted () {
    this.getCities()
  },
  methods: {
    ...mapMutations([
      'hideSnackbar'
    ]),
    ...mapActions([
      'downSettlementStatistic',
      'downSettlementByWorker',
      'solveSettleProblem',
      'getCities'
    ]),
    handleChangeCity (value) {
      this.city = value
      this.getData()
    },
    handleChangeYear (value) {
      this.year = value
      this.getData()
    },
    handleChangeMonth (value) {
      this.month = value
      this.getData()
    },
    topBtnBuild () {
      this.solveSettleProblem({
        month: this.year + '-' + this.month
      })
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
    }
  }
}
</script>
<style>
.worker-form {
  margin: 24px;
}
</style>

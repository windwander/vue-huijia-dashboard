<template>
<div class="">
  <mainMenu />
  <mu-appbar title="美车师结算项设置" class="setting-appbar">
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
      <mu-raised-button :label="bonusPenaltyFinished ? '当月已结算' : '预保存结算'" icon="save" class="raised-button" @click="topBtnSave" primary :disabled="bonusPenaltyFinished"/>
      <mu-raised-button label="导出表格" icon="print" class="raised-button" @click="topBtnPrint" secondary/>
    </div>
  </mu-appbar>
  <WorkerTable :height="tableHeight" />
  <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar"/>
</div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import mainMenu from './units/mainMenu'
import WorkerTable from './WorkerTable'
import dropDownMenu from 'muse-components/dropDownMenu'
import {menuItem} from 'muse-components/menu'
import snackbar from 'muse-components/snackbar'
import raisedButton from 'muse-components/raisedButton'

Vue.component(raisedButton.name, raisedButton)
Vue.component(snackbar.name, snackbar)
Vue.component(dropDownMenu.name, dropDownMenu)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'Home',
  components: {
    mainMenu,
    WorkerTable
  },
  data () {
    const dateYear = new Date().getFullYear().toString()
    const dateMonth = new Date().getMonth() + 1
    return {
      city: 320100,
      year: dateYear,
      month: dateMonth < 10 ? ('0' + dateMonth) : dateMonth,
      tableHeight: ''
    }
  },
  computed: {
    ...mapState([
      'cities',
      'snackbar',
      'snackbarMsg',
      'bonusPenaltyFinished'
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
      'getPreSaveWorkerMonthList',
      'doAddBonusPenalty',
      'exportWorkMonth',
      'hasDoneBonusPenalty',
      'getCities'
    ]),
    getData () {
      const postData = {
        cityCode: this.city,
        workMonth: this.year + '-' + this.month
      }
      this.hasDoneBonusPenalty(postData)
      this.getPreSaveWorkerMonthList(postData)
    },
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
    topBtnSave () {
      this.doAddBonusPenalty({
        cityCode: this.city,
        workMonth: this.year + '-' + this.month
      })
    },
    topBtnPrint () {
      this.exportWorkMonth({
        cityCode: this.city,
        workMonth: this.year + '-' + this.month
      })
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
</style>

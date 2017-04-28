<template>
<div class="">
  <mainMenu />
  <mu-appbar title="美车师结算项设置" class="setting-appbar">
    <div class="setting-dropdown" slot="right">
      <label for="cityDropDown">城市：</label>
      <mu-dropDown-menu :value="city" @change="handleChangeCity" id="cityDropDown">
        <mu-menu-item value="320100" title="南京"/>
      </mu-dropDown-menu>
    </div>
    <div class="setting-dropdown" slot="right">
      <label for="monthDropDown">月份：</label>
      <mu-dropDown-menu :value="year" @change="handleChangeYear" id="yearDropDown">
        <mu-menu-item value="2017" title="2017年" />
        <mu-menu-item value="2018" title="2018年" />
        <mu-menu-item value="2019" title="2019年" />
        <mu-menu-item value="2020" title="2020年" />
      </mu-dropDown-menu>
      <mu-dropDown-menu :value="month" @change="handleChangeMonth" id="monthDropDown">
        <mu-menu-item v-for="n in 12" :key="n" :value="n < 10 ? ('0' + n) : n" :title="n + '月'" />
      </mu-dropDown-menu>
    </div>
  </mu-appbar>
  <WorkerTable height="auto" />
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
      city: '320100',
      year: dateYear,
      month: dateMonth < 10 ? ('0' + dateMonth) : dateMonth
    }
  },
  computed: {
    ...mapState([
      'snackbar',
      'snackbarMsg'
    ])
  },
  mounted () {
    this.getData()
  },
  methods: {
    ...mapMutations([
      'hideSnackbar'
    ]),
    ...mapActions([
      'getPreSaveWorkerMonthList'
    ]),
    getData () {
      this.getPreSaveWorkerMonthList({
        cityCode: this.city,
        workMonth: this.year + '-' + this.month
      })
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
    }
  }
}
</script>

<style>
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

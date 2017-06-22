<template>
<div :class="{'drawer-opened': openDrawer}">
  <MainMenu />
  <mu-appbar title="美车师结算项设置" class="setting-appbar">
    <div class="setting-dropdown" slot="right">
      <Group :handleChange="changeSelect" />
    </div>
    <div class="setting-dropdown" slot="right">
      <DateSelect :showDate="false" :showMonthAll="false" :handleChange="changeSelect" />
    </div>
    <div class="top-btn" slot="right">
      <mu-raised-button :label="bonusPenaltyFinished ? '当月已结算' : '确认生成结算'" icon="save" class="raised-button" @click="topBtnSave" primary :disabled="bonusPenaltyFinished"/>
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
import MainMenu from '../units/mainMenu'
import WorkerTable from '../WorkerTable'
import Group from '../units/group'
import DateSelect from '../units/dateSelect'
import dropDownMenu from 'muse-components/dropDownMenu'
import {menuItem} from 'muse-components/menu'
import snackbar from 'muse-components/snackbar'
import raisedButton from 'muse-components/raisedButton'

Vue.component(raisedButton.name, raisedButton)
Vue.component(snackbar.name, snackbar)
Vue.component(dropDownMenu.name, dropDownMenu)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'BalanceConfig',
  components: {
    MainMenu,
    WorkerTable,
    Group,
    DateSelect
  },
  data () {
    return {
      tableHeight: ''
    }
  },
  computed: {
    ...mapState([
      'city',
      'group',
      'year',
      'month',
      'snackbar',
      'snackbarMsg',
      'bonusPenaltyFinished',
      'openDrawer'
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
      'getPreSaveWorkerMonthList',
      'doAddBonusPenalty',
      'exportWorkMonth',
      'hasDoneBonusPenalty'
    ]),
    getData () {
      const postData = {
        cityCode: this.city,
        workMonth: this.year + '-' + this.month
      }
      this.hasDoneBonusPenalty(postData)
      this.getPreSaveWorkerMonthList(postData)
    },
    changeSelect () {
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
/*html, body {
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
}*/
</style>

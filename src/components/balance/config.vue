<template>
<div :class="{'drawer-opened': openDrawer}">
  <MainMenu title="美车师结算项设置"/>
  <div class="toolbox">
    <div class="month-select-dropdown">
      <DateSelect :showDate="false" :showMonthAll="false" :handleChange="changeSelect" />
    </div>
    <div class="top-btn">
      <mu-raised-button :label="bonusPenaltyFinished ? '当月已结算' : '确认生成结算'" icon="save" class="raised-button" @click="topBtnSave" primary :disabled="bonusPenaltyFinished"/>
      <mu-raised-button label="导出表格" icon="print" class="raised-button" @click="topBtnPrint" secondary/>
    </div>
  </div>
  <BalanceConfigTable :height="tableHeight" />
  <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar"/>
</div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import MainMenu from '../units/mainMenu'
import BalanceConfigTable from './balanceConfigTable'
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
    BalanceConfigTable,
    DateSelect
  },
  data () {
    return {
      tableHeight: ''
    }
  },
  mounted () {
    this.getData()
    this.tableHeight = 'calc(100vh - 188px)'
  },
  watch: {
    city: function () {
      this.getData()
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

<style scoped>
.toolbox {

}
.toolbox .month-select-dropdown {
  display: inline-block;
}
.toolbox .top-btn {
  display: inline-block;
  margin-top: 8px;
  vertical-align: top;
}
</style>

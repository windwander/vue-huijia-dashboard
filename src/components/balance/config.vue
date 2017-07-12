<template>
<div :class="{'drawer-opened': openDrawer}">
  <MainMenu title="美车师结算项设置"/>
  <div class="toolbox-balance-config">
    <div class="month-select-dropdown">
      <DateSelect :showDate="false" :showMonthAll="false" :handleChange="changeSelect" />
    </div>
    <div class="top-btn">
      <mu-raised-button :label="bonusPenaltyFinished ? '当月已结算' : '确认生成结算'" icon="save" class="primary-button" @click="topBtnSave" primary :disabled="bonusPenaltyFinished"/>
      <mu-raised-button label="导出表格" icon="print" class="secondary-button" @click="topBtnPrint" secondary/>
    </div>
  </div>
  <div class="table-container">
    <BalanceConfigTable :height="tableHeight" />
  </div>
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
    this.tableHeight = 'calc(100vh - 152px)'
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

<style>
.toolbox-balance-config .mu-dropDown-menu-text {
  color: #fff;
}
</style>
<style scoped>
.toolbox-balance-config {
  position: absolute;
  top: 0;
  right: 50px;
  color: #fff;
  height: 74px;
  line-height: 74px;
}
.toolbox-balance-config .month-select-dropdown {
  display: inline-block;
}
.toolbox-balance-config .top-btn {
  display: inline-block;
}
.toolbox-balance-config .top-btn .primary-button {
  margin-right: 20px;
}
.table-container {
  width: 100vw;
  height: calc(100vh - 74px);
  overflow-x: auto;
  overflow-y: hidden; 
}
</style>

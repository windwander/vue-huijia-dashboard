<template>
<div :class="{'drawer-opened': openDrawer}">
  <MainMenu title="美车师结算项设置"/>
  <div class="toolbox-balance-config">
    <div class="month-select-dropdown">
      <DateSelect :showDate="false" :showMonthAll="false" :handleChange="changeSelect" />
    </div>
    <div class="top-btn">
      <mu-raised-button :label="bonusPenaltyFinished ? '当月已结算' : '确认生成结算'" icon="save" class="primary-button" @click="topBtnSave" primary :disabled="bonusPenaltyFinished"/>
      <!-- <mu-raised-button label="导出表格" icon="print" class="secondary-button" @click="topBtnPrint" secondary/> -->
    </div>
  </div>
  <el-table
    :data="workerTableData"
    border
    fit
    highlight-current-row
    @current-change="handleCurrentChange"
    :default-sort="{prop: 'date', order: 'descending'}"
    :height="tableHeight"
    class="balance-config-table"
  >
    <el-table-column
      type="index"
      fixed="left"
      min-width="60">
    </el-table-column>
    <el-table-column
      prop="workerName"
      fixed="left"
      label="姓名"
      sortable
      min-width="100">
    </el-table-column>
    <el-table-column
      prop="phone"
      label="美车师手机号"
      sortable
      min-width="130">
    </el-table-column>
    <el-table-column
      prop="startDate"
      label="上岗时间"
      sortable
      min-width="120">
      <template scope="scope">
        <el-date-picker
          v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId"
          v-model="rowData.startDate"
          type="date"
          placeholder="上岗时间"
          :picker-options="pickerStartDate">
        </el-date-picker>
        <div v-else>
          {{ scope.row.startDate }}
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="position"
      label="职务"
      sortable
      min-width="120">
      <template scope="scope">
        <el-select v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.position" placeholder="请选择职务">
          <el-option
            v-for="item in dictionary.wcwDictionaryDetails"
            :key="item.codeKey"
            :label="item.codeValue"
            :value="item.codeKey">
          </el-option>
        </el-select>
        <div v-else>
          {{ positionName(scope.row.position) }}
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="realWorkDays"
      label="本月工作天数"
      min-width="80">
      <template scope="scope">
        <el-input
          v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.realWorkDays"
        >
        </el-input>
        <div v-else>
          {{ scope.row.realWorkDays }}
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="workDays"
      label="本月电动车扣费天数"
      min-width="80">
      <template scope="scope">
        <el-input
          v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId"
          v-model="rowData.workDays"
        >
        </el-input>
        <div v-else>
          {{ scope.row.workDays }}
        </div>
      </template>
    </el-table-column>
    <el-table-column label="奖励及补贴">
      <el-table-column
        prop="pearlWards"
        label="伯乐奖"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.pearlWards"
          >
          </el-input>
          <div v-else>
            {{ scope.row.pearlWards }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="trainAllowance"
        label="培训奖励"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.trainAllowance"
          >
          </el-input>
          <div v-else>
            {{ scope.row.trainAllowance }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="fixedAllowance"
        label="定点补贴"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.fixedAllowance"
          >
          </el-input>
          <div v-else>
            {{ scope.row.fixedAllowance }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="bonusOther1"
        label="其他1"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.bonusOther1"
          >
          </el-input>
          <div v-else>
            {{ scope.row.bonusOther1 }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="bonusOther2"
        label="其他2"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.bonusOther2"
          >
          </el-input>
          <div v-else>
            {{ scope.row.bonusOther2 }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="bonusOther3"
        label="其他3"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.bonusOther3"
          >
          </el-input>
          <div v-else>
            {{ scope.row.bonusOther3 }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
    <el-table-column label="罚款及杂费">
      <el-table-column
        prop="delayAgreement"
        label="延迟履约"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.delayAgreement"
          >
          </el-input>
          <div v-else>
            {{ scope.row.delayAgreement }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="complaint"
        label="投诉追责"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.complaint"
          >
          </el-input>
          <div v-else>
            {{ scope.row.complaint }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="cheat"
        label="费用骗取"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.cheat"
          >
          </el-input>
          <div v-else>
            {{ scope.row.cheat }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="delayTake"
        label="延迟接单"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.delayTake"
          >
          </el-input>
          <div v-else>
            {{ scope.row.delayTake }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="nonstandard"
        label="服务不规范"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.nonstandard"
          >
          </el-input>
          <div v-else>
            {{ scope.row.nonstandard }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="delayTurnFrom"
        label="转单延迟1"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.delayTurnFrom"
          >
          </el-input>
          <div v-else>
            {{ scope.row.delayTurnFrom }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="delayTurnTo"
        label="转单延迟2"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.delayTurnTo"
          >
          </el-input>
          <div v-else>
            {{ scope.row.delayTurnTo }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="train"
        label="培训费用"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.train"
          >
          </el-input>
          <div v-else>
            {{ scope.row.train }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="telephoneFare"
        label="话费"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.telephoneFare"
          >
          </el-input>
          <div v-else>
            {{ scope.row.telephoneFare }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="insurance"
        label="保险"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.insurance"
          >
          </el-input>
          <div v-else>
            {{ scope.row.insurance }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="penaltyOther1"
        label="其他1"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.penaltyOther1"
          >
          </el-input>
          <div v-else>
            {{ scope.row.penaltyOther1 }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="penaltyOther2"
        label="其他2"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.penaltyOther2"
          >
          </el-input>
          <div v-else>
            {{ scope.row.penaltyOther2 }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="penaltyOther3"
        label="其他3"
        min-width="80">
        <template scope="scope">
          <el-input
            v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" v-model="rowData.penaltyOther3"
          >
          </el-input>
          <div v-else>
            {{ scope.row.penaltyOther3 }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
    <el-table-column
      fixed="right"
      prop="date"
      label="操作"
      min-width="64">
      <template scope="scope">
        <el-button type="primary" size="small" v-if="!bonusPenaltyFinished && selectedId === scope.row.workerId" @click="saveRow">保存</el-button>
        <el-button type="primary" size="small" v-if="bonusPenaltyFinished" @click="getDetail(scope.row)">查看</el-button>
      </template>
    </el-table-column>
  </el-table>
  <Modal :title="modalTitle" />
  <!-- <Modal :title="modalTitle" :modalTitleBtn="true" modalTitleBtnIcon="print" :modalTitleBtnClick="printWorkerDetail"/> -->
  <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar"/>
</div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import { Button, Select, Option, Table, TableColumn, Input, DatePicker } from 'element-ui'
import moment from 'moment'
import MainMenu from '../units/mainMenu'
import DateSelect from '../units/dateSelect'
import Modal from '../units/Modal'
import dropDownMenu from 'muse-components/dropDownMenu'
import {menuItem} from 'muse-components/menu'
import snackbar from 'muse-components/snackbar'
import raisedButton from 'muse-components/raisedButton'

Vue.use(Button)
Vue.use(Select)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Option)
Vue.use(Input)
Vue.use(DatePicker)
Vue.component(raisedButton.name, raisedButton)
Vue.component(snackbar.name, snackbar)
Vue.component(dropDownMenu.name, dropDownMenu)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'BalanceConfig',
  components: {
    MainMenu,
    DateSelect,
    Modal
  },
  data () {
    return {
      tableHeight: 300,
      selectedId: '',
      workerName: '',
      modalTitle: '',
      rowData: {
        startDate: '',
        position: '',
        realWorkDays: '',
        workDays: '',
        pearlWards: '',
        trainAllowance: '',
        fixedAllowance: '',
        bonusOther1: '',
        bonusOther2: '',
        bonusOther3: '',
        delayAgreement: '',
        complaint: '',
        cheat: '',
        delayTake: '',
        nonstandard: '',
        delayTurnFrom: '',
        delayTurnTo: '',
        train: '',
        telephoneFare: '',
        insurance: '',
        penaltyOther1: '',
        penaltyOther2: '',
        penaltyOther3: ''
      },
      funcTableHeight: {},
      pickerStartDate: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  mounted () {
    this.getData()
    this.getDictionaryByCode('WORKER_POSITION')
    // 监听窗口高度改变，调整表格高度
    const z = this
    function debounce (func, wait) {
      let timer = null
      return function () {
        clearTimeout(timer)
        timer = setTimeout(func, wait)
      }
    }
    function setTableHeight () {
      z.tableHeight = window.innerHeight - 74
    }
    setTableHeight()
    z.funcTableHeight = debounce(setTableHeight, 400)
    window.addEventListener('resize', this.funcTableHeight)
  },
  destroyed () {
    window.removeEventListener('resize', this.funcTableHeight)
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
      'workerTableData',
      'dictionary',
      'openDrawer'
    ])
  },
  methods: {
    ...mapMutations([
      'hideSnackbar'
    ]),
    ...mapActions([
      'preSaveWorkerMonth',
      'getPreSaveWorkerMonthList',
      'getWorkerBonusPenaltyByMonth',
      'doAddBonusPenalty',
      'exportWorkMonth',
      'exportBonusPenalty',
      'hasDoneBonusPenalty',
      'getDictionaryByCode'
    ]),
    getData () {
      const postData = {
        cityCode: this.city,
        workMonth: this.year + '-' + this.month
      }
      this.hasDoneBonusPenalty(postData)
      this.getPreSaveWorkerMonthList(postData)
    },
    handleCurrentChange: function (row, oldRow) {
      const newId = row && row.workerId
      if (row && newId !== this.selectedId) {
        this.selectedId = newId
        this.rowData = {
          startDate: row.startDate,
          position: row.position,
          realWorkDays: row.realWorkDays,
          workDays: row.workDays,
          pearlWards: row.pearlWards,
          trainAllowance: row.trainAllowance,
          fixedAllowance: row.fixedAllowance,
          bonusOther1: row.bonusOther1,
          bonusOther2: row.bonusOther2,
          bonusOther3: row.bonusOther3,
          delayAgreement: row.delayAgreement,
          complaint: row.complaint,
          cheat: row.cheat,
          delayTake: row.delayTake,
          nonstandard: row.nonstandard,
          delayTurnFrom: row.delayTurnFrom,
          delayTurnTo: row.delayTurnTo,
          train: row.train,
          telephoneFare: row.telephoneFare,
          insurance: row.insurance,
          penaltyOther1: row.penaltyOther1,
          penaltyOther2: row.penaltyOther2,
          penaltyOther3: row.penaltyOther3
        }
      }
    },
    positionName (position) {
      let positionName = position
      this.dictionary.wcwDictionaryDetails.map(p => {
        if (p.codeKey === position) {
          positionName = p.codeValue
        }
      })
      return positionName
    },
    saveRow: function (e) {
      const z = this
      let saveData = Object.assign({}, z.rowData, {
        workerId: z.selectedId,
        workMonth: z.year + '-' + z.month,
        cityCode: z.city
      })
      if (typeof saveData.startDate !== 'string') {
        saveData.startDate = moment(saveData.startDate).format('YYYY-MM-DD')
      }
      z.preSaveWorkerMonth(saveData)
      z.selectedId = 0
    },
    getDetail: function (row) {
      const z = this
      z.modalTitle = row.workerName + ' 美车师的结算项详情'
      z.workerName = row.workerName
      z.workMonth = z.year + '-' + z.month
      const getData = {
        workerId: row.workerId,
        workMonth: z.workMonth
      }
      z.getWorkerBonusPenaltyByMonth(getData)
    },
    printWorkerDetail: function () {
      const z = this
      const getData = {
        workerName: z.workerName,
        workerId: z.selectedId,
        workMonth: z.year + '-' + z.month,
        cityCode: z.city
      }
      z.exportBonusPenalty(getData)
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
.balance-config-table.el-table .cell, .balance-config-table.el-table th>div {
  padding-left: 10px;
  padding-right: 10px;
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
.el-date-editor.el-input {
  width: auto;
}
</style>

<template>
  <div class="balance-config-table">
    <mu-table :fixedHeader="fixedHeader" :fixedFooter="fixedFooter" :height="height" :enableSelectAll="enableSelectAll" :multiSelectable="multiSelectable" :selectable="selectable" :showCheckbox="showCheckbox" @rowClick="rowClick">
      <mu-thead slot="header" class="table-header">
        <mu-tr>
          <mu-th v-for="item,index in workerTableHead" :key="'balance-config-table-head' + index" :class="'balance-config-td-'+ index" :title="item">{{item}}</mu-th>
        </mu-tr>
      </mu-thead>
      <mu-tbody class="my-tbody">
        <mu-tr v-for="item,index in workerTableData" :key="item.workerId" :data-id="item.workerId" v-bind:class="(Number(selectedId) === item.workerId) ? 'show-save-btn' : ''">
          <mu-td v-for="(value, key, index) in item" :key="key" :title="(index > 0) && workerTableHead[--index]" :class="'balance-config-td-'+ (index - 1)">
            <mu-select-field v-if="!bonusPenaltyFinished && Number(selectedId) === item.workerId && key === 'position'" :value="value" :labelFocusClass="['label-foucs']">
              <mu-menu-item key="1" value="1" title="实习美车师" />
              <mu-menu-item key="2" value="2" title="正式美车师" />
              <mu-menu-item key="3" value="3" title="实习业务组长" />
              <mu-menu-item key="4" value="4" title="正式业务组长" />
              <mu-menu-item key="5" value="5" title="实习销售经理" />
              <mu-menu-item key="6" value="6" title="正式销售经理" />
            </mu-select-field>
            <mu-date-picker v-else-if="!bonusPenaltyFinished && Number(selectedId) === item.workerId && key === 'startDate'" :value="value" :name="key" mode="landscape" />
            <!--<mu-date-picker v-else-if="!bonusPenaltyFinished && Number(selectedId) === item.workerId && key === 'quitDate'" :value="value === '在职' ? '' : value" :name="key"/>-->
            <mu-text-field v-else-if="!bonusPenaltyFinished && Number(selectedId) === item.workerId && index > 2 && index !== 4" class="text-field" :value="value" :name="key"/>
            <div v-else-if="key === 'position'" :name="key" class="td-text">{{['实习美车师', '正式美车师', '实习业务组长', '正式业务组长', '实习销售经理', '正式销售经理'][value-1]}}</div>
            <div v-else :name="key" class="td-text">{{value}}</div>
          </mu-td>
          <mu-td>
            <mu-raised-button v-if="!bonusPenaltyFinished" label="保存" class="save-btn" secondary ref="saveBtn" @click="saveRow"/>
            <mu-raised-button v-else label="查看" class="detail-btn" secondary ref="detailBtn" @click="getDetail(item.workerId, item.workerName)"/>
          </mu-td>
        </mu-tr>
      </mu-tbody>
    </mu-table>
    <Modal :title="modalTitle" :modalTitleBtn="true" modalTitleBtnIcon="print" :modalTitleBtnClick="printWorkerDetail"/>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import {table, thead, tbody, tfoot, tr, th, td} from 'muse-components/table'
import pagination from 'muse-components/pagination'
import raisedButton from 'muse-components/raisedButton'
import datePicker from 'muse-components/datePicker'
import Modal from '../units/Modal'

Vue.component(datePicker.name, datePicker)
Vue.component(raisedButton.name, raisedButton)
Vue.component(pagination.name, pagination)
Vue.component(table.name, table)
Vue.component(thead.name, thead)
Vue.component(tbody.name, tbody)
Vue.component(tfoot.name, tfoot)
Vue.component(tr.name, tr)
Vue.component(th.name, th)
Vue.component(td.name, td)
export default {
  name: 'BalanceConfigTable',
  components: {
    Modal
  },
  props: {
    fixedHeader: {
      type: Boolean,
      default: true
    },
    fixedFooter: {
      type: Boolean,
      default: true
    },
    selectable: {
      type: Boolean,
      default: true
    },
    multiSelectable: {
      type: Boolean,
      default: false
    },
    enableSelectAll: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    height: {
      type: String,
      default: '480px'
    }
  },
  data () {
    return {
      row: {},
      selectedId: '',
      modalTitle: '',
      workerName: '',
      workerId: '',
      workMonth: ''
    }
  },
  computed: {
    ...mapState([
      'workerTableHead',
      'workerTableData',
      'preSaveWorkerMonthList',
      'bonusPenaltyFinished'
    ])
  },
  methods: {
    ...mapActions([
      'preSaveWorkerMonth',
      'getWorkerBonusPenaltyByMonth',
      'exportBonusPenalty'
    ]),
    rowClick: function (index, tr) {
      this.row = tr
      this.selectedId = tr.$el.dataset.id
    },
    saveRow: function (e) {
      const z = this
      let newObj = {}
      let originData = {}
      let saveData = {}
      z.row.$children.slice(0, -1).map((td, index) => {
        if (td.$children[0]) {
          const el = td.$children[0].$refs.input || td.$children[0].$refs.textField || td.$children[0].$children[0]
          if (td.$children[0].$refs.input) {
            newObj[el.name] = el.value
          } else if (td.$children[0].$refs.textField) {
            newObj['position'] = el.value
          } else if (td.$children[0].$children[0]) {
            if (index === 4) {
              newObj['startDate'] = el.value
            }
            if (index === 5) {
              newObj['quitDate'] = el.value
            }
          }
        } else if (index === 0) {
          newObj['workerId'] = td.$el.innerText
        }
      })
      z.preSaveWorkerMonthList.map(el => {
        if (el.workerId === Number(newObj.workerId)) {
          originData = el
        }
      })
      saveData = Object.assign({}, originData, newObj)
      z.preSaveWorkerMonth(saveData)
    },
    getDetail: function (workerId, workerName) {
      const z = this
      z.modalTitle = workerName + ' 美车师的结算项详情'
      z.workerName = workerName
      z.workerId = workerId
      z.workMonth = z.preSaveWorkerMonthList[0].workMonth
      const getData = {
        workerId: z.workerId,
        workMonth: z.workMonth
      }
      z.getWorkerBonusPenaltyByMonth(getData)
    },
    printWorkerDetail: function () {
      const z = this
      const getData = {
        workerName: z.workerName,
        workerId: z.workerId,
        workMonth: z.workMonth,
        cityCode: '320100'
      }
      z.exportBonusPenalty(getData)
    }
  }
}
</script>

<style lang="css">
.balance-config-table .table-header {
  background-color: #eee;
}
.balance-config-table .table-header .mu-th {
  padding: 5px;
  box-sizing: content-box;
  color: #333;
  border-bottom: 1px solid #c7c7c7;
  text-align: center;
}
.balance-config-table .mu-th-wrapper {
  white-space: pre-wrap;
}
.balance-config-table .mu-tr {
  height: 60px;
}
.balance-config-table .mu-td {
  padding: 5px;
  white-space: pre-wrap;
  text-align: center;
}
.balance-config-table tbody .mu-td input {
  text-align: center;
}
.balance-config-table .table-footer-pagination {
  display: block;
  padding: 1em;
}
.balance-config-table .table-footer-pagination .mu-pagination {
  justify-content: center;
}
.balance-config-table .mu-text-field {
  width: auto;
  min-height: 1em;
  margin: 0;
  padding: 0;
}
.balance-config-table .mu-select-field {
  width: 114px;
}
.balance-config-table .mu-date-picker {
  width: 90px;
}
.balance-config-table .mu-text-field-content {
  margin: 0;
  padding: 0;
}
.balance-config-table .balance-config-td--1 {
  display: none;
}
.balance-config-table .balance-config-td-1 {
  width: 7em;
}
.balance-config-table .balance-config-td-2 {
  width: 9em;
}
.balance-config-table .balance-config-td-3 {
  width: 8em;
}
.balance-config-table .balance-config-td-4 {
  width: 9em;
}
.balance-config-table .show-save-btn .mu-td {
  line-height: .01;
}
.balance-config-table .balance-config-td-7.mu-th::after {
  content: '奖励及补贴';
  position: absolute;
  top: 10px;
  left: 10em;
  width: 5em;
}
.balance-config-table .balance-config-td-13.mu-th::after {
  content: '罚款及杂费';
  position: absolute;
  top: 10px;
  left: 25em;
  width: 5em;
}
.balance-config-table .save-btn, .balance-config-table .detail-btn {
  min-width: 60px;
  line-height: 2;
  height: 2em;
  font-size: 14px;
  margin: 0;
  white-space: normal;
}
.balance-config-table .save-btn {
  display: none;
}
.balance-config-table .show-save-btn .save-btn {
  display: inline-block;
}
.balance-config-table .td-text {
  font-size: 16px;
}
/*
.mu-menu-list .mu-menu-item {
  padding: 0 12px;
}
.mu-dialog {
  width: auto !important;
}*/
</style>

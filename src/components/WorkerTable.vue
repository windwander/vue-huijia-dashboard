<template>
  <div class="worker-table">
    <mu-table :fixedHeader="fixedHeader" :fixedFooter="fixedFooter" :height="height" :enableSelectAll="enableSelectAll" :multiSelectable="multiSelectable" :selectable="selectable" :showCheckbox="showCheckbox" @rowClick="rowClick">
      <mu-thead slot="header" class="table-header">
        <mu-tr>
          <mu-th v-for="item,index in tableHead" :key="'worker-table-head' + index" :class="'worker-td-'+ index" :title="item">{{item}}</mu-th>
        </mu-tr>
      </mu-thead>
      <mu-tbody>
        <mu-tr v-for="item,index in tableData" :key="item.workerId" :data-id="item.workerId" v-bind:class="(Number(selectedId) === item.workerId) ? 'show-save-btn' : ''">
          <mu-td v-for="(value, key, index) in item" :key="key" :title="(index > 0) && tableHead[--index] + ': ' + value" :class="'worker-td-'+ (index - 1)">
            <mu-select-field v-if="key==='position'" :value="value" :labelFocusClass="['label-foucs']">
              <mu-menu-item key="1" value="1" title="实习美车师" />
              <mu-menu-item key="2" value="2" title="正式美车师" />
              <mu-menu-item key="3" value="3" title="实习业务组长" />
              <mu-menu-item key="4" value="4" title="正式业务组长" />
              <mu-menu-item key="5" value="5" title="实习销售经理" />
              <mu-menu-item key="6" value="6" title="正式销售经理" />
            </mu-select-field>
            <mu-date-picker v-else-if="key==='startDate'" :value="value" :name="key"/>
            <mu-text-field v-else-if="index > 2" class="text-field" :value="value" :name="key"/>
            <div v-else :name="key" class="td-text">{{value}}</div>
          </mu-td>
          <mu-td>
            <mu-raised-button label="保存" class="save-btn" secondary ref="saveBtn" @click="saveRow"/>
          </mu-td>
        </mu-tr>
      </mu-tbody>
    </mu-table>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import {table, thead, tbody, tfoot, tr, th, td} from 'muse-components/table'
import pagination from 'muse-components/pagination'
import raisedButton from 'muse-components/raisedButton'
import datePicker from 'muse-components/datePicker'

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
  name: 'workerTable',
  components: {
    pagination
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
      selectedId: ''
    }
  },
  computed: {
    ...mapState([
      'tableHead',
      'tableData',
      'preSaveWorkerMonthList'
    ])
  },
  methods: {
    ...mapActions([
      'preSaveWorkerMonth'
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
            newObj['startDate'] = el.value
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
    }
  }
}
</script>

<style lang="css">
.table-header {
  background-color: #eee;
}
.table-header .mu-th {
  padding: 0 2em;
  color: #333;
  border-bottom: 1px solid #c7c7c7;
}
.worker-table .mu-th-wrapper {
  white-space: pre-wrap;
}
.worker-table .mu-td {
  padding: 1em;
  white-space: pre-wrap;
  line-height: .01;
}
.table-footer-pagination {
  display: block;
  padding: 1em;
}
.table-footer-pagination .mu-pagination {
  justify-content: center;
}
.worker-table .mu-text-field {
  width: auto;
  min-height: 1em;
  margin: 0;
  padding: 0;
}
.worker-table .mu-select-field {
  width: 114px;
}
.worker-table .mu-date-picker {
  width: 90px;
}
.worker-table .mu-text-field-content {
  margin: 0;
  padding: 0;
}
.mu-menu-list .mu-menu-item {
  padding: 0 12px;
}
.worker-table .worker-td--1 {
  display: none;
}
.worker-table .worker-td-0 {
  width: 7em;
}
.worker-table .worker-td-1 {
  width: 10em;
}
.worker-table .worker-td-2 {
  width: 9em;
}
.worker-table .worker-td-3 {
  width: 10em;
}
.worker-table .save-btn {
  min-width: 3em;
  line-height: 2em;
  height: 2em;
  margin: 0;
  display: none;
  white-space: normal;
}
.worker-table .show-save-btn .save-btn {
  display: inline-block;
}
.worker-table .td-text {
  font-size: 16px;
}
.mu-dialog {
  width: auto !important;
}
</style>

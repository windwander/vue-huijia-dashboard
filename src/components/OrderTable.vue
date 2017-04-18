<template>
  <div class="order-table">
    <mu-table :fixedHeader="fixedHeader" :fixedFooter="fixedFooter" :height="height" :enableSelectAll="enableSelectAll" :multiSelectable="multiSelectable" :selectable="selectable" :showCheckbox="showCheckbox">
      <mu-thead slot="header" class="table-header">
        <mu-tr>
          <mu-th v-for="item,index in tableHead" :key="'order-table-head' + index" :title="item">{{item}}</mu-th>
        </mu-tr>
      </mu-thead>
      <mu-tbody>
        <mu-tr v-for="item,index in tableData" :key="item.orderId" :selected="item.selected">
          <mu-td v-for="(value, key) in item" :key="key" :title="value">{{value}}</mu-td>
        </mu-tr>
      </mu-tbody>
    </mu-table>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import {table, thead, tbody, tfoot, tr, th, td} from 'muse-components/table'

Vue.component(table.name, table)
Vue.component(thead.name, thead)
Vue.component(tbody.name, tbody)
Vue.component(tfoot.name, tfoot)
Vue.component(tr.name, tr)
Vue.component(th.name, th)
Vue.component(td.name, td)
export default {
  name: 'OrderTable',
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
  computed: {
    ...mapState([
      'tableHead',
      'tableData'
    ])
  }
}
</script>

<style lang="css">
.table-header {
  background-color: #eee;
}
.table-header .mu-th {
  color: #333;
  border-bottom: 1px solid #c7c7c7;
}
.order-table .mu-td {
  padding: 1em;
  white-space: pre-wrap;
}
</style>

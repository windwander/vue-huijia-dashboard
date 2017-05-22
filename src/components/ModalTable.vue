<template>
  <div class="order-table">
    <mu-table :fixedHeader="fixedHeader" :fixedFooter="fixedFooter" :height="height" :enableSelectAll="enableSelectAll" :multiSelectable="multiSelectable" :selectable="selectable" :showCheckbox="showCheckbox">
      <mu-thead slot="header" class="table-header">
        <mu-tr>
          <mu-th v-for="item,index in modalTableHead" :key="'order-table-head' + index" :title="item">{{item}}</mu-th>
        </mu-tr>
      </mu-thead>
      <mu-tbody>
        <mu-tr v-for="item,index in modalTableData" :key="item.orderId" :selected="item.selected">
          <mu-td v-for="(value, key) in item" :key="key" :title="value">{{value}}</mu-td>
        </mu-tr>
      </mu-tbody>
      <mu-tfoot v-if="pagination.totalPages > 1" slot="footer" class="table-footer-pagination">
        <mu-pagination :total="pagination.total" :current="pagination.page + 1" :pageSize="pagination.size" @pageChange="pageChange" />
      </mu-tfoot>
    </mu-table>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import {table, thead, tbody, tfoot, tr, th, td} from 'muse-components/table'
import pagination from 'muse-components/pagination'

Vue.component(pagination.name, pagination)
Vue.component(table.name, table)
Vue.component(thead.name, thead)
Vue.component(tbody.name, tbody)
Vue.component(tfoot.name, tfoot)
Vue.component(tr.name, tr)
Vue.component(th.name, th)
Vue.component(td.name, td)
export default {
  name: 'ModalTable',
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
    },
    change: {
      type: Function
    }
  },
  computed: {
    ...mapState([
      'modalTableHead',
      'modalTableData',
      'pagination'
    ])
  },
  methods: {
    pageChange (newIndex) {
      this.$store.commit('changePage', newIndex - 1)
      this.change()
    }
  }
}
</script>

<style lang="css">
.table-header {
  background-color: #eee;
}
.table-header .mu-th {
  padding: 0 1em;
  color: #333;
  border-bottom: 1px solid #c7c7c7;
}
.order-table .mu-th-wrapper {
  white-space: pre-wrap;
}
.order-table .mu-td {
  padding: 1em;
  white-space: pre-wrap;
}
.table-footer-pagination {
  display: block;
  padding: 1em;
}
.table-footer-pagination .mu-pagination {
  justify-content: center;
}
</style>

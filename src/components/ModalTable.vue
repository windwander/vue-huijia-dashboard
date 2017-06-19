<template>
  <div class="order-table">
    <mu-table :fixedHeader="fixedHeader" :fixedFooter="fixedFooter" :height="height" :enableSelectAll="enableSelectAll" :multiSelectable="multiSelectable" :selectable="selectable" :showCheckbox="showCheckbox">
      <mu-thead slot="header" class="table-header">
        <mu-tr>
          <mu-th v-for="item,index in modalTableHead" :key="'order-table-head' + index" :title="item" :class="'mt-' + index">{{item}}</mu-th>
          <mu-th v-if="cellButtons">操作</mu-th>
        </mu-tr>
      </mu-thead>
      <mu-tbody>
        <mu-tr v-for="item,index in modalTableData" :key="item.orderId" :selected="item.selected">
          <mu-td v-for="(value, key, index) in item" :key="key" :title="value" :class="'mt-' + index">{{value}}</mu-td>
          <mu-td v-if="cellButtons" class="buttons">
            <mu-icon-button icon="location_searching" title="在地图上定位" @click="locate(item.orderId || item.phone)" />
          </mu-td>
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
import iconButton from 'muse-components/iconButton'
import pagination from 'muse-components/pagination'

Vue.component(pagination.name, pagination)
Vue.component(table.name, table)
Vue.component(thead.name, thead)
Vue.component(tbody.name, tbody)
Vue.component(tfoot.name, tfoot)
Vue.component(tr.name, tr)
Vue.component(th.name, th)
Vue.component(td.name, td)
Vue.component(iconButton.name, iconButton)
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
    },
    cellButtons: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState([
      'modalTableHead',
      'modalTableData',
      'pagination',
      'city',
      'group'
    ])
  },
  methods: {
    pageChange (newIndex) {
      this.$store.commit('changePage', newIndex - 1)
      this.change()
    },
    locate (id) {
      this.$store.commit('hidePopup')
      this.$store.dispatch('doSearch', {
        input: encodeURIComponent(id),
        cityCode: this.city,
        leaderId: this.group
      })
    }
  }
}
</script>

<style scoped>
.table-header {
  background-color: #eee;
}
.table-header .mu-th {
  padding: 0 6px;
  color: #333;
  border-bottom: 1px solid #c7c7c7;
}
.mu-td {
  padding: 12px 6px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}
.mu-td.buttons {
  white-space: initial;
}
.mt-6 {
  width: 60px;
}
.table-footer-pagination {
  display: block;
  padding: 1em;
}
.table-footer-pagination .mu-pagination {
  justify-content: center;
}
</style>
<style>
.order-table .mu-th-wrapper {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}
</style>

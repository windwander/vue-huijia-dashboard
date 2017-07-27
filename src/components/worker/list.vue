<template>
<div :class="{'drawer-opened': openDrawer}">
  <MainMenu title="美车师管理" />
  <div class="toolbox-worker-list">
    <mu-text-field hintText="输入手机号搜索" class="search-input" v-model="searchString" ref="searchField" />
    <mu-icon-button icon="search" class="search-btn" color="#FFF" @click="search()"/>
  </div>
  <el-table
    :data="workerManageList"
    border
    fit
    highlight-current-row
    @current-change="handleCurrentChange"
    :default-sort="{prop: 'date', order: 'descending'}"
    :height="tableHeight"
  >
    <el-table-column
      type="index"
      fixed="left"
      min-width="60">
    </el-table-column>
    <el-table-column
      prop="name"
      fixed="left"
      label="姓名"
      sortable
      min-width="120">
    </el-table-column>
    <el-table-column
      prop="phone"
      label="手机号"
      sortable
      min-width="130">
    </el-table-column>
    <el-table-column
      prop="idCard"
      label="身份证号"
      sortable
      min-width="190">
    </el-table-column>
    <el-table-column
      prop="applyTime"
      label="申请时间"
      sortable
      min-width="150">
    </el-table-column>
    <el-table-column
      prop="cityCode"
      :formatter="cityName"
      label="城市"
      sortable
      min-width="90">
    </el-table-column>
    <el-table-column
      prop="serviceStatus"
      label="接单状态"
      sortable
      min-width="120">
        <template scope="scope">
          <el-tag :type="scope.row.serviceStatus ? 'success' : 'gray'">{{ serviceStatusName(scope.row.serviceStatus) }}</el-tag>
        </template>
    </el-table-column>
    <el-table-column
      prop="workPhone"
      label="工作手机号"
      sortable
      min-width="150">
      <template scope="scope">
        <el-input v-model="rowPhone" placeholder="请输入工作手机号" v-if="selectedId === scope.row.workerId">
        </el-input>
        <div v-else>
          {{ scope.row.workPhone }}
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="group"
      label="小组"
      sortable
      min-width="130">
      <template scope="scope">
        <el-select v-model="rowGroup" placeholder="请选择组别" v-if="selectedId === scope.row.workerId">
          <el-option
            v-for="item in groups"
            :key="item.leaderId"
            :label="item.leaderName"
            :value="item.leaderId">
          </el-option>
        </el-select>
        <div v-else>
          {{ groupName(scope.row.group) }}
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="position"
      label="职务"
      sortable
      min-width="130">
      <template scope="scope">
        <el-select v-model="rowPosition" placeholder="请选择职务" v-if="selectedId === scope.row.workerId">
          <el-option
            v-for="item in dictionary.wcwDictionaryDetails"
            v-if="item.codeKey>=scope.row.position"
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
      fixed="right"
      prop="date"
      label="操作"
      min-width="140">
      <template scope="scope">
        <el-button v-if="selectedId === scope.row.workerId" @click="doChangeInfo" type="primary" size="small">保存</el-button>
        <el-button v-if="selectedId === scope.row.workerId" @click="openDialog" type="danger" size="small">注销</el-button>
      </template>
    </el-table-column>
  </el-table>
  <mu-dialog :open="dialog" title="确认注销账号" @close="closeDialog">
    <mu-date-picker hintText="请选择美车师离职时间" v-model="quitDate" mode="landscape" fullWidth :maxDate="quitDateMax" />
    <span class="dialog-help-text">*仅可选择当月及之前时间</span>
    <mu-flat-button slot="actions" @click="closeDialog" primary label="取消"/>
    <mu-flat-button slot="actions" primary @click="doWorkerQuit" :disabled="!quitDate" label="确定"/>
  </mu-dialog>
  <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar" />
</div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import { Button, Select, Option, Table, TableColumn, Input, Tag } from 'element-ui'
import MainMenu from '../units/mainMenu'
import Group from '../units/group'
import snackbar from 'muse-components/snackbar'
import flatButton from 'muse-components/flatButton'
import dialog from 'muse-components/dialog'
import datePicker from 'muse-components/datePicker'
import iconButton from 'muse-components/iconButton'

Vue.use(Button)
Vue.use(Select)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Option)
Vue.use(Input)
Vue.use(Tag)
Vue.component(flatButton.name, flatButton)
Vue.component(dialog.name, dialog)
Vue.component(datePicker.name, datePicker)
Vue.component(snackbar.name, snackbar)
Vue.component(iconButton.name, iconButton)
export default {
  name: 'WorkerList',
  components: {
    MainMenu,
    Group
  },
  data () {
    function getDate () {
      const date = new Date()
      let dateString = ''
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      month = month > 9 ? month : '0' + month
      let day = (new Date(year, month, 0)).getDate()
      dateString = year + '-' + month + '-' + day
      return dateString
    }
    return {
      quitDateMax: getDate(),
      quitDate: '',
      searchString: '',
      selectedId: '',
      tableHead: ['美车师ID', '#', '美车师姓名', '美车师账号', '身份证号', '申请时间', '城市', '接单状态', '工作手机号', '小组', '职务', '操作'],
      rowGroup: '',
      rowPosition: '',
      rowPhone: '',
      dialog: false,
      positionCodes: [],
      tableHeight: 300
    }
  },
  computed: {
    ...mapState([
      'city',
      'cities',
      'group',
      'groups',
      'snackbar',
      'snackbarMsg',
      'workerManageList',
      'dictionary',
      'openDrawer'
    ])
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
  methods: {
    ...mapMutations([
      'showSnackbar',
      'hideSnackbar'
    ]),
    ...mapActions([
      'getWorkersByStatus',
      'changeWorkerInfo',
      'workerQuit',
      'getDictionaryByCode'
    ]),
    search () {
      this.getData()
    },
    getData () {
      const postData = {
        cityCode: this.city,
        parentId: this.group
      }
      if (this.searchString) {
        if (/^1\d{10}$/.test(this.searchString)) {
          postData.phone = this.searchString
        } else {
          this.showSnackbar('请输入正确的手机号')
        }
      }
      this.getWorkersByStatus(postData)
    },
    cityName (row, column, cityCode) {
      let cityName = cityCode
      this.cities.map(c => {
        if (c.cityCode === cityCode) {
          cityName = c.cityName
        }
      })
      return cityName
    },
    serviceStatusName (status) {
      let statusName = status ? '服务中' : '停止服务'
      return statusName
    },
    groupName (parentId) {
      let groupName = parentId
      this.groups.map(g => {
        if (g.leaderId === parentId) {
          groupName = g.leaderName
        }
      })
      return groupName
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
    handleCurrentChange: function (row, oldRow) {
      const newId = row && row.workerId
      if (row && newId !== this.selectedId) {
        this.selectedId = newId
        this.rowGroup = row.group
        this.rowPhone = row.workPhone
        this.rowPosition = row.position
      }
    },
    openDialog () {
      this.dialog = true
    },
    closeDialog () {
      this.dialog = false
    },
    doChangeInfo () {
      const z = this
      const data = {
        workerId: z.selectedId,
        parentId: z.rowGroup,
        workPhone: z.rowPhone,
        position: z.rowPosition
      }
      z.changeWorkerInfo(data).then(function () {
        z.getData()
        z.selectedId = ''
      })
    },
    doWorkerQuit () {
      const z = this
      const data = {
        workerId: z.selectedId,
        quitTime: z.quitDate + ' 00:00:00'
      }
      z.workerQuit(data).then(function () {
        z.closeDialog()
        z.getData()
        z.selectedId = ''
      })
    }
  }
}
</script>

<style>
.toolbox-worker-list .mu-text-field-input {
    color: #fff;
}
</style>
<style scoped>
.toolbox-worker-list {
  position: absolute;
  top: 0;
  right: 50px;
  color: #fff;
  height: 74px;
  line-height: 74px;
}
.toolbox-worker-list .search-input {
  width: 160px;
  margin-top: -2px;
}
.toolbox-worker-list .search-btn {
  position: absolute;
  bottom: 16px;
  right: -8px;
  width: 36px;
  height: 36px;
  padding: 0;
}
.dialog-help-text {
  font-size: 14px;
}
</style>

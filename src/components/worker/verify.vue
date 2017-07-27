<template>
<div :class="{'drawer-opened': openDrawer}">
  <MainMenu title="美车师审核"/>
  <div class="toolbox-worker-verify">
    <div class="toolbox-setting-date">
      <div class="date-picker-box">
        <mu-date-picker hintText="开始时间" mode="landscape" v-model="startDate" fullWidth :maxDate="endDate" @input="getData"/>
      </div>
      <span class="date-picker-splitter">至</span>
      <div class="date-picker-box">
        <mu-date-picker hintText="结束时间" mode="landscape" v-model="endDate" fullWidth :minDate="startDate" @input="getData"/>
      </div>
    </div>
    <div class="toolbox-setting-search">
      <mu-text-field hintText="输入手机号搜索" class="search-input" v-model="searchString" ref="searchField" />
      <mu-icon-button icon="search" class="search-btn" color="#FFF" @click="search()"/>
    </div>
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
      min-width="120">
      <template scope="scope">
        <el-button @click="openDialog" type="primary" size="small" :disabled="(selectedId !== scope.row.workerId) || !rowFinished">{{(selectedId === scope.row.workerId) && rowFinished ? '审核通过' : '请完善信息'}}</el-button>
      </template>
    </el-table-column>
  </el-table>
  <mu-dialog :open="dialog" title="请再次确认" @close="closeDialog">
    审核通过后不可回退，请再次确认审核通过！
    <mu-flat-button slot="actions" @click="closeDialog" primary label="取消"/>
    <mu-flat-button slot="actions" primary @click="verified" label="确定"/>
  </mu-dialog>
  <mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar" />
</div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import { Button, Select, Option, Table, TableColumn, Input } from 'element-ui'
import moment from 'moment'
import MainMenu from '../units/mainMenu'
import Group from '../units/group'
import snackbar from 'muse-components/snackbar'
import dialog from 'muse-components/dialog'
import datePicker from 'muse-components/datePicker'

Vue.use(Button)
Vue.use(Select)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Option)
Vue.use(Input)
Vue.component(datePicker.name, datePicker)
Vue.component(dialog.name, dialog)
Vue.component(snackbar.name, snackbar)
export default {
  name: 'WorkerVerify',
  components: {
    MainMenu,
    Group
  },
  data () {
    return {
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      searchString: '',
      selectedId: '',
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
      'groups',
      'snackbar',
      'snackbarMsg',
      'workerManageList',
      'dictionary',
      'openDrawer'
    ]),
    rowFinished: function () {
      return Boolean(this.rowGroup) && Boolean(this.rowPosition) && Boolean(this.rowPhone)
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
  methods: {
    ...mapMutations([
      'showSnackbar',
      'hideSnackbar'
    ]),
    ...mapActions([
      'getWorkersByStatus',
      'changeToWorking',
      'getDictionaryByCode'
    ]),
    search () {
      this.getData()
    },
    getData () {
      const postData = {
        cityCode: this.city,
        verify: true,
        startDay: this.startDate + ' 00:00:00',
        endDay: this.endDate + ' 23:59:59'
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
    verified () {
      const z = this
      const data = {
        workerId: z.selectedId,
        parentId: z.rowGroup,
        workPhone: z.rowPhone,
        position: z.rowPosition
      }
      z.closeDialog()
      z.changeToWorking(data).then(function () {
        z.getData()
      })
    }
  }
}
</script>

<style>
.toolbox-worker-verify .mu-text-field-input {
    color: #fff;
}
</style>
<style scoped>
.toolbox-worker-verify {
  position: absolute;
  top: 0;
  right: 50px;
  color: #fff;
  height: 74px;
  line-height: 74px;
}
.toolbox-setting-date {
  display: inline-block;
}
.toolbox-setting-date .date-picker-box {
  display: inline-block;
  width: 100px;
}
.toolbox-setting-date .date-picker-splitter {
  margin: 0 10px;
}
.toolbox-setting-search {
  display: inline-block;
  line-height: 46px;
  margin-left: 48px;
  position: relative;
}
.toolbox-setting-search .search-input {
  width: 160px;
  margin-top: -2px;
}
.toolbox-setting-search .search-btn {
  position: absolute;
  bottom: 16px;
  right: -8px;
  width: 36px;
  height: 36px;
  padding: 0;
}
</style>

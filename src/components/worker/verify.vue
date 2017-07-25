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
      min-width="60">
    </el-table-column>
    <el-table-column
      prop="name"
      label="美车师姓名"
      sortable
      min-width="130">
    </el-table-column>
    <el-table-column
      prop="phone"
      label="美车师手机号"
      sortable
      min-width="150">
    </el-table-column>
    <el-table-column
      prop="idCard"
      label="身份证号"
      sortable
      min-width="160">
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
   <!-- <div class="table-container">
    <mu-table :fixedHeader="true" :showCheckbox="false" class="worker-verify-table" height="calc(100vh - 135px)" @rowClick="rowClick">
      <mu-thead slot="header" class="table-header">
        <mu-tr>
          <mu-th v-for="item,index in tableHead" :key="'worker-table-head' + index" :class="'worker-td-'+ index" :title="item">{{item}}</mu-th>
        </mu-tr>
      </mu-thead>
      <mu-tbody>
        <mu-tr v-for="item,index in workerManageList" :key="item.workerId" :data-id="item.workerId" :data-group="item.group" :data-position="item.position" :data-work-phone="item.workPhone">
          <mu-td v-for="(value, key, index) in item" :key="key" :class="'worker-td-'+ index">
            <div v-if="key === 'cityCode'" :name="key" class="td-text">{{cityName(value)}}</div>
            <div v-else-if="(selectedId !== item.workerId) && (key === 'group')" :name="key" class="td-text">{{groupName(value)}}</div>
            <mu-select-field v-else-if="(selectedId === item.workerId) && (key === 'group')" :value="value" @change="selectRowGroup" class="worker-verify-select" ref="group" fullWidth>
              <mu-menu-item value="" title="请选择组别"/>
              <mu-menu-item v-for="item in groups" :key="item.leaderId" :value="item.leaderId" :title="item.leaderName"/>
            </mu-select-field>
            <div v-else-if="(selectedId !== item.workerId) && (key === 'position')" :name="key" class="td-text">{{positionName(value)}}</div>
            <mu-select-field v-else-if="(selectedId === item.workerId) && (key === 'position')" :value="value" @change="selectRowPosition" class="worker-verify-select" ref="position" fullWidth>
              <mu-menu-item value="" title="请选择职务"/>
              <mu-menu-item v-for="(value, key) in dictionary.wcwDictionaryDetails" :key="value.codeKey" :value="value.codeKey" :title="value.codeValue" />
            </mu-select-field>
            <mu-text-field v-else-if="(selectedId === item.workerId) && (key === 'workPhone')" class="text-field" hintText="请输入手机号" :value="value" @input="inputRowPhone" @blur="checkRowPhone" :errorText="rowErrorPhone" :name="key" fullWidth/>
            <div v-else :name="key" class="td-text">{{value}}</div>
          </mu-td>
          <mu-td>
            <mu-raised-button :label="(selectedId === item.workerId) && rowFinished ? '审核通过' : '请完善信息'" class="verify-btn" secondary ref="verifyBtn" :disabled="(selectedId !== item.workerId) || !rowFinished" @click="openDialog" />
          </mu-td>
        </mu-tr>
      </mu-tbody>
    </mu-table>
  </div> -->
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
import dropDownMenu from 'muse-components/dropDownMenu'
import selectField from 'muse-components/selectField'
import {menuItem} from 'muse-components/menu'
import snackbar from 'muse-components/snackbar'
import raisedButton from 'muse-components/raisedButton'
import flatButton from 'muse-components/flatButton'
import dialog from 'muse-components/dialog'
import textField from 'muse-components/textField'
import datePicker from 'muse-components/datePicker'
import iconButton from 'muse-components/iconButton'

Vue.use(Button)
Vue.use(Select)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Option)
Vue.use(Input)
Vue.component(raisedButton.name, raisedButton)
Vue.component(flatButton.name, flatButton)
Vue.component(dialog.name, dialog)
Vue.component(textField.name, textField)
Vue.component(datePicker.name, datePicker)
Vue.component(snackbar.name, snackbar)
Vue.component(dropDownMenu.name, dropDownMenu)
Vue.component(iconButton.name, iconButton)
Vue.component(selectField.name, selectField)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'WorkerVerify',
  components: {
    MainMenu,
    Group
  },
  data () {
    // function currentDate () {
    //   const date = new Date()
    //   let dateString = date.getFullYear()
    //   let month = date.getMonth() + 1
    //   month = month > 9 ? month : '0' + month
    //   let day = date.getDate()
    //   day = day > 9 ? day : '0' + day
    //   dateString += '-' + month + '-' + day
    //   return dateString
    // }
    return {
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      searchString: '',
      selectedId: '',
      tableHead: ['美车师ID', '#', '美车师姓名', '美车师账号', '身份证号', '申请时间', '城市', '工作手机号', '小组', '职务', '操作'],
      rowGroup: '',
      rowPosition: '',
      rowPhone: '',
      rowErrorPhone: '',
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
      return Boolean(this.rowGroup) && Boolean(this.rowPosition) && Boolean(this.rowPhone) && !this.rowErrorPhone
    }
  },
  mounted () {
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
    window.addEventListener('resize', debounce(setTableHeight, 400))
    this.getData()
    this.getDictionaryByCode('WORKER_POSITION')
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
    changeSelect () {
      this.getData()
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
    rowClick: function (index, tr) {
      this.row = tr
      const newId = Number(tr.$el.dataset.id)
      if (newId !== this.selectedId) {
        this.selectedId = newId
        this.rowGroup = tr.$el.dataset.group
        this.rowPhone = Number(tr.$el.dataset.workPhone)
        this.rowPosition = tr.$el.dataset.position
        this.rowErrorPhone = ''
      }
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
    selectRowGroup (v) {
      this.rowGroup = v
    },
    selectRowPosition (v) {
      this.rowPosition = v
    },
    inputRowPhone (v) {
      this.rowPhone = v
    },
    checkRowPhone () {
      if (!/^1\d{10}$/.test(this.rowPhone)) {
        this.rowErrorPhone = '请输入正确的手机号'
      } else {
        this.rowErrorPhone = ''
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
.worker-verify-table .table-header .mu-th {
  padding: 0;
  color: #333;
  border-bottom: 1px solid #c7c7c7;
  text-align: center;
}
.worker-verify-table .mu-th-wrapper {
  white-space: pre-wrap;
}
.worker-verify-table .mu-tr {
  height: 60px;
}
.worker-verify-table .mu-td {
  font-size: 16px;
  padding: 10px 5px;
  white-space: pre-wrap;
  text-align: center;
  word-wrap: break-word;
  word-break: break-all;
}
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
.worker-verify-table .table-header {
  background-color: #eee;
}
.worker-verify-table .worker-td-0 {
  display: none;
}
.worker-verify-table .worker-td-1 {
  width: 60px;
}
.worker-verify-table .worker-td-3 {
  min-width: 130px;
}
.worker-verify-table .worker-td-4 {
  width: 220px;
}
.worker-verify-table .worker-td-7,
.worker-verify-table .worker-td-8,
.worker-verify-table .worker-td-9 {
  white-space: normal;
}
.verify-btn {
  min-width: 60px;
  line-height: 1;
  height: 2em;
  font-size: 14px;
  margin: 0;
  white-space: normal;
}
.table-container {
  width: 100vw;
  height: calc(100vh - 74px);
  overflow-x: auto;
  overflow-y: hidden; 
}
</style>

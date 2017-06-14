<template>
<div :class="{'drawer-opened': openDrawer}">
  <mainMenu />
  <mu-appbar title="美车师管理" class="setting-appbar">
    <div class="setting-dropdown" slot="right">
      <Group :handleChange="changeSelect" />
    </div>
    <div class="setting-search" slot="right">
      <mu-text-field hintText="输入手机号搜索" class="search-input" v-model="searchString" ref="searchField" />
      <mu-icon-button icon="search" class="search-btn" color="#FFF" @click="search()"/>
    </div>
  </mu-appbar>
  <mu-table :fixedHeader="true" :showCheckbox="false" class="worker-manage-table" height="calc(100vh - 135px)" @rowClick="rowClick">
    <mu-thead slot="header" class="table-header">
      <mu-tr>
        <mu-th v-for="item,index in tableHead" :key="'worker-table-head' + index" :class="'worker-td-'+ index" :title="item">{{item}}</mu-th>
      </mu-tr>
    </mu-thead>
    <mu-tbody>
      <mu-tr v-for="item,index in workerManageList" :key="item.workerId" :data-id="item.workerId" :data-group="item.group" :data-position="item.position" :data-work-phone="item.workPhone">
        <mu-td v-for="(value, key, index) in item" :key="key" :class="'worker-td-'+ index">
          <div v-if="key === 'cityCode'" :name="key" class="td-text">{{cityName(value)}}</div>
          <div v-else-if="key === 'serviceStatus'" :name="key" class="td-text">{{serviceStatusName(value)}}</div>
          <div v-else-if="(selectedId !== item.workerId) && (key === 'group')" :name="key" class="td-text">{{groupName(value)}}</div>
          <mu-select-field v-else-if="(selectedId === item.workerId) && (key === 'group')" :value="value" @change="selectRowGroup" class="worker-manage-select" ref="group" fullWidth>
            <mu-menu-item value="" title="请选择组别"/>
            <mu-menu-item v-for="item in groups" :key="item.leaderId" :value="item.leaderId" :title="item.leaderName"/>
          </mu-select-field>
          <div v-else-if="(selectedId !== item.workerId) && (key === 'position')" :name="key" class="td-text">{{positionName(value)}}</div>
          <mu-select-field v-else-if="(selectedId === item.workerId) && (key === 'position')" :value="value" @change="selectRowPosition" class="worker-manage-select" ref="position" fullWidth>
            <mu-menu-item value="" title="请选择职务"/>
            <mu-menu-item v-for="(pos, key) in dictionary.wcwDictionaryDetails" v-if="pos.codeKey >=value" :key="pos.codeKey" :value="pos.codeKey" :title="pos.codeValue" />
          </mu-select-field>
          <mu-text-field v-else-if="(selectedId === item.workerId) && (key === 'workPhone')" class="text-field" hintText="请输入手机号" :value="value" @input="inputRowPhone" @blur="checkRowPhone" :errorText="rowErrorPhone" :name="key" fullWidth/>
          <div v-else :name="key" class="td-text">{{value}}</div>
        </mu-td>
        <mu-td class="worker-manage-btns">
          <mu-raised-button v-if="selectedId === item.workerId" label="保存" class="row-btn" secondary @click="doChangeInfo" />
          <mu-raised-button v-if="selectedId === item.workerId" label="注销" class="row-btn" primary @click="openDialog" />
        </mu-td>
      </mu-tr>
    </mu-tbody>
  </mu-table>
  <mu-dialog :open="dialog" title="确认注销账号" @close="closeDialog">
    <mu-date-picker hintText="请选择美车师离职时间" v-model="quitDate" fullWidth :maxDate="quitDateMax" />
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
import mainMenu from './units/mainMenu'
import Group from './units/group'
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
  name: 'Home',
  components: {
    mainMenu,
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
      rowErrorPhone: '',
      dialog: false,
      positionCodes: []
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
    ]),
    rowFinished: function () {
      return Boolean(this.rowGroup) && Boolean(this.rowPosition) && Boolean(this.rowPhone) && !this.rowErrorPhone
    }
  },
  mounted () {
    this.getData()
    this.getDictionaryByCode('WORKER_POSITION')
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
    changeSelect () {
      this.getData()
    },
    cityName (cityCode) {
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
    rowClick: function (index, tr) {
      this.row = tr
      const newId = Number(tr.$el.dataset.id)
      if (newId !== this.selectedId) {
        this.selectedId = newId
        this.rowGroup = tr.$el.dataset.group
        this.rowPhone = Number(tr.$el.dataset.workPhone)
        this.rowPosition = tr.$el.dataset.position
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
html, body {
  overflow-x: auto;
  overflow-y: hidden; 
}
.setting-appbar.mu-appbar {
  height: 74px;
  padding-left: 100px;
  background-color: #00bcd4;
}
.setting-dropdown {
  line-height: 46px;
  margin-right: 48px;
}
.setting-dropdown label {
  vertical-align: text-bottom;
}
.setting-dropdown .mu-dropDown-menu-text {
  color: #fff;
}
.worker-manage-table .table-header {
  background-color: #eee;
}
.worker-manage-table .table-header .mu-th {
  padding: 0;
  color: #333;
  border-bottom: 1px solid #c7c7c7;
  text-align: center;
}
.worker-manage-table .mu-th-wrapper {
  white-space: pre-wrap;
}
.worker-manage-table .mu-tr {
  height: 60px;
}
.worker-manage-table .mu-td {
  font-size: 16px;
  padding: 1em;
  white-space: pre-wrap;
  text-align: center;
  word-wrap: break-word;
  word-break: break-all;
}
.worker-manage-table .worker-td-0 {
  display: none;
}
.worker-manage-table .worker-td-1 {
  width: 62px;
}
.worker-manage-table .worker-td-8,
.worker-manage-table .worker-td-9,
.worker-manage-table .worker-td-10 {
  white-space: normal;
}
.worker-manage-table .worker-manage-btns {
  width: 160px;
}
.setting-appbar .mu-text-field-input {
  color: #fff;
}
</style>
<style scoped>
.date-picker-box {
  display: inline-block;
  width: 100px;
}
.date-picker-splitter {
  margin: 0 10px;
}
.setting-search {
  line-height: 46px;
  margin-right: 48px;
  position: relative;
}
.search-input {
  width: 160px;
  margin-top: -2px;
}
.search-btn {
  position: absolute;
  bottom: 16px;
  right: -8px;
  width: 36px;
  height: 36px;
  padding: 0;
}
.row-btn {
  width: 60px;
  min-width: 60px;
  line-height: 1;
  height: 2em;
  font-size: 14px;
  margin: 0;
  white-space: normal;
}
.dialog-help-text {
  font-size: 14px;
}
</style>

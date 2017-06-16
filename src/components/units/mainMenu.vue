<template>
  <div class="main-menu">
    <mu-float-button class="main-menu-toggle"
                     icon="menu"
                     @click="toggleDrawer"
                     secondary/>
    <mu-drawer :open="openDrawer"
               @close="toggleDrawer">
      <div class="header">
        <avatar />
        <mu-icon-menu icon="more_vert" class="header-avatar-menu">
          <mu-menu-item title="退出登录" leftIcon="exit_to_app" class="header-avatar-menu-item" @click="logout" />
        </mu-icon-menu>
      </div>
      <div class="group-box">
        <MenuGroup class="select-box" />
      </div>
      <mu-divider class="divider"/>
      <mu-list>
        <mu-list-item v-if="menusArray.Home" title="运营视图" to="/">
          <mu-icon slot="left" value="map"/>
        </mu-list-item>
        <mu-list-item v-if="menusArray.bonusList || menusArray.settleList" title="结算报表" toggleNested>
          <mu-icon slot="left" value="list"/>
          <mu-list-item v-if="menusArray.bonusList" slot="nested" title="美车师结算项设置" to="list">
            <mu-icon slot="left" value="edit"/>
          </mu-list-item>
          <mu-list-item v-if="menusArray.settleList" slot="nested" title="美车师结算汇总" to="settleList">
            <mu-icon slot="left" value="assignment"/>
          </mu-list-item>
        </mu-list-item>
        <mu-list-item v-if="menusArray.overallChart || menusArray.compareChart" title="运营趋势" toggleNested>
          <mu-icon slot="left" value="list"/>
          <mu-list-item v-if="menusArray.overallChart" slot="nested" title="整体趋势" to="overallChart">
            <mu-icon slot="left" value="assessment"/>
          </mu-list-item>
          <mu-list-item v-if="menusArray.compareChart" slot="nested" title="对比分析" to="compareChart">
            <mu-icon slot="left" value="compare"/>
          </mu-list-item>
        </mu-list-item>
        <mu-list-item v-if="menusArray.workerVerify || menusArray.workerManage" title="美车师管理" toggleNested>
          <mu-icon slot="left" value="list"/>
          <mu-list-item v-if="menusArray.workerVerify" slot="nested" title="美车师审核" to="workerVerify">
            <mu-icon slot="left" value="verified_user"/>
          </mu-list-item>
          <mu-list-item v-if="menusArray.workerManage" slot="nested" title="美车师管理" to="workerManage">
            <mu-icon slot="left" value="supervisor_account"/>
          </mu-list-item>
        </mu-list-item>
      </mu-list>
    </mu-drawer>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import floatButton from 'muse-components/floatButton'
import drawer from 'muse-components/drawer'
import { list, listItem } from 'muse-components/list'
import { menuItem } from 'muse-components/menu'
import divider from 'muse-components/divider'
import iconMenu from 'muse-components/iconMenu'
import avatar from './avatar'
import MenuGroup from './menuGroup'

Vue.component(floatButton.name, floatButton)
Vue.component(drawer.name, drawer)
Vue.component(list.name, list)
Vue.component(listItem.name, listItem)
Vue.component(menuItem.name, menuItem)
Vue.component(divider.name, divider)
Vue.component(iconMenu.name, iconMenu)
export default {
  components: {
    avatar,
    MenuGroup
  },
  created () {
    if (!(this.menus && this.menus.length)) {
      this.getMenu()
    }
  },
  methods: {
    ...mapActions([
      'getMenu',
      'doLogout'
    ]),
    ...mapMutations([
      'toggleDrawer'
    ]),
    logout: function () {
      this.doLogout()
    }
  },
  computed: {
    ...mapState([
      'openDrawer'
    ]),
    ...mapGetters([
      'menusArray'
    ])
  }
}
</script>

<style>
html, body {
  min-height: auto;
}
.main-menu {
  position: absolute;
}
.main-menu-toggle {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  background-color: #F05B47;
}
.main-menu-toggle.mu-float-button {
  font-size: 52px;
  width: 52px;
  height: 52px;
  background-color: #F05B47;
}
.drawer-opened {
  padding-left: 256px;
  transition: all .45s cubic-bezier(.23,1,.32,1);
}
.drawer-opened #headSearchBox {
  left: 336px;
  transition: all .45s cubic-bezier(.23,1,.32,1);
}
.header-avatar-menu-item .mu-menu-item-title {
  margin-left: 32px;
}
</style>
<style scoped>
.header {
  height: 100px;
  display: flex;
  align-content: center;
  align-items: center;
  align-self: center;
  justify-content: center;
}
.divider {
  margin: 30px 0 20px;
}
</style>

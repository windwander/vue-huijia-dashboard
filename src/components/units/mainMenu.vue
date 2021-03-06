<template>
  <div class="main-menu" :class="{'has-appbar': title}">
    <mu-float-button class="main-menu-toggle"
                     :icon="openDrawer ? 'arrow_back' : 'menu'"
                     @click="toggleDrawer"
                     secondary/>
    <mu-appbar v-if="title" :title="title" class="appbar"></mu-appbar>
    <mu-drawer :open="openDrawer"
               @close="toggleDrawer">
      <div class="header">
        <Avatar />
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
        <mu-list-item v-if="menusArray.orderChart || menusArray.orderList" title="订单" toggleNested>
          <mu-icon slot="left" value="list"/>
          <mu-list-item slot="nested" v-if="menusArray.orderChart" title="订单数据分析" to="/order/chart">
            <mu-icon slot="left" value="assessment"/>
          </mu-list-item>
          <mu-list-item slot="nested" v-if="menusArray.orderList" title="订单管理" to="/order/list">
            <mu-icon slot="left" value="assignment"/>
          </mu-list-item>
        </mu-list-item>
        <mu-list-item title="美车师" v-if="menusArray.workerChart || menusArray.workerVerify || menusArray.workerList" toggleNested>
          <mu-icon slot="left" value="list"/>
          <!--<mu-list-item slot="nested" v-if="menusArray.workerChart" title="美车师数据分析" to="/worker/chart">
            <mu-icon slot="left" value="assessment"/>
          </mu-list-item>-->
          <mu-list-item slot="nested" v-if="menusArray.workerVerify" title="美车师审核" to="/worker/verify">
            <mu-icon slot="left" value="assignment_turned_in"/>
          </mu-list-item>
          <mu-list-item slot="nested" v-if="menusArray.workerList" title="美车师管理" to="/worker/list">
            <mu-icon slot="left" value="assignment_ind"/>
          </mu-list-item>
        </mu-list-item>
        <mu-list-item title="产品" v-if="menusArray.productChart" toggleNested>
          <mu-icon slot="left" value="list"/>
          <mu-list-item slot="nested" v-if="menusArray.productChart" title="产品数据分析" to="/product/chart">
            <mu-icon slot="left" value="assessment"/>
          </mu-list-item>
          <!--<mu-list-item slot="nested" v-if="menusArray.productChart" title="产品管理" to="/product/list">
            <mu-icon slot="left" value="shop_two"/>
          </mu-list-item>
          <mu-list-item slot="nested" v-if="menusArray.productChart" title="产品优惠券管理" to="/product/coupon">
            <mu-icon slot="left" value="card_giftcard"/>-->
          </mu-list-item>
        </mu-list-item>
        <!--<mu-list-item title="收入" v-if="menusArray.incomeChart" toggleNested>
          <mu-icon slot="left" value="list"/>
          <mu-list-item slot="nested" v-if="menusArray.incomeChart" title="收入数据分析" to="/income/chart">
            <mu-icon slot="left" value="assessment"/>
          </mu-list-item>
        </mu-list-item>-->
        <mu-list-item title="结算" v-if="menusArray.balanceConfig || menusArray.balanceList" toggleNested>
          <mu-icon slot="left" value="list"/>
          <mu-list-item slot="nested" v-if="menusArray.balanceConfig" title="美车师结算项设置" to="/balance/config">
            <mu-icon slot="left" value="assignment_returned"/>
          </mu-list-item>
          <mu-list-item slot="nested" v-if="menusArray.balanceList" title="结算汇总" to="/balance/list">
            <mu-icon slot="left" value="assignment"/>
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
import appbar from 'muse-components/appbar'
import drawer from 'muse-components/drawer'
import { list, listItem } from 'muse-components/list'
import { menuItem } from 'muse-components/menu'
import divider from 'muse-components/divider'
import iconMenu from 'muse-components/iconMenu'
import Avatar from './avatar'
import MenuGroup from './menuGroup'

Vue.component(floatButton.name, floatButton)
Vue.component(appbar.name, appbar)
Vue.component(drawer.name, drawer)
Vue.component(list.name, list)
Vue.component(listItem.name, listItem)
Vue.component(menuItem.name, menuItem)
Vue.component(divider.name, divider)
Vue.component(iconMenu.name, iconMenu)
export default {
  name: 'MainMenu',
  components: {
    Avatar,
    MenuGroup
  },
  props: {
    title: {
      type: String
    }
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
      'menus',
      'openDrawer'
    ]),
    ...mapGetters([
      'menusArray'
    ])
  }
}
</script>

<style>
.drawer-opened {
  padding-left: 256px;
  transition: all .45s cubic-bezier(.23,1,.32,1);
}
.main-menu .router-link-exact-active {
  background-color: #eee;
}
</style>
<style scoped>
.appbar.mu-appbar {
  height: 74px;
  padding-left: 74px;
}
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
.main-menu {
  position: absolute;
}
.main-menu.has-appbar {
  position: static;
}
.main-menu-toggle {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  background-color: #F05B47;
}
.drawer-opened .main-menu-toggle {
  left: 266px;
  transition: left .45s cubic-bezier(.23,1,.32,1);
}
.main-menu-toggle.mu-float-button {
  font-size: 52px;
  width: 52px;
  height: 52px;
  background-color: #F05B47;
}
.header-avatar-menu-item .mu-menu-item-title {
  margin-left: 32px;
}
</style>

<template>
  <div class="main-menu">
    <mu-float-button class="main-menu-toggle"
                     icon="menu"
                     @click="toggle()"
                     secondary/>
    <mu-drawer :open="open"
               :docked="false"
               @close="toggle()">
      <mu-list @itemClick="toggle()">
        <mu-list-item v-if="Boolean(menus.find(m => m.menu === 'Home'))" title="运营视图" to="/">
          <mu-icon slot="left" value="map"/>
        </mu-list-item>
        <mu-list-item title="结算报表" toggleNested>
          <mu-icon slot="left" value="list"/>
          <mu-list-item v-if="Boolean(menus.find(m => m.menu === 'bonusList'))" slot="nested" title="美车师结算项设置" to="list">
            <mu-icon slot="left" value="edit"/>
          </mu-list-item>
          <mu-list-item v-if="Boolean(menus.find(m => m.menu === 'settleList'))" slot="nested" title="美车师结算汇总" to="settleList">
            <mu-icon slot="left" value="assignment"/>
          </mu-list-item>
          <!--<mu-list-item v-if="Boolean(menus.find(m => m.menu === 'overallChart'))" slot="nested" title="运营图表" to="charts">
            <mu-icon slot="left" value="assessment"/>
          </mu-list-item>
          <mu-list-item v-if="Boolean(menus.find(m => m.menu === 'compareChart'))" slot="nested" title="对比图表" to="charts">
            <mu-icon slot="left" value="compare"/>
          </mu-list-item>-->
        </mu-list-item>
      </mu-list>
    </mu-drawer>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import floatButton from 'muse-components/floatButton'
import drawer from 'muse-components/drawer'
import { list, listItem } from 'muse-components/list'

Vue.component(floatButton.name, floatButton)
Vue.component(drawer.name, drawer)
Vue.component(list.name, list)
Vue.component(listItem.name, listItem)
export default {
  data () {
    return {
      open: false
    }
  },
  created () {
    if (!(this.menus && this.menus.length)) {
      this.getMenu()
    }
  },
  methods: {
    ...mapActions([
      'getMenu'
    ]),
    toggle () {
      this.open = !this.open
    }
  },
  computed: {
    ...mapState([
      'menus'
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
</style>

<template>
  <div>
    <div v-if="cities && cities.length" class="city-select">
      <mu-select-field :value="city" @change="handleChangeCity" class="city-select-field" ref="city">
        <mu-menu-item value="" title="全部城市"/>
        <mu-menu-item v-for="item in cities" :key="item.cityCode" :value="item.cityCode" :title="item.cityName"/>
      </mu-select-field>
    </div>
    <div v-if="groups && groups.length" class="group-select">
      <mu-select-field :value="group" @change="handleChangeGroup" class="group-select-field" ref="group">
        <mu-menu-item value="" title="全部小组"/>
        <mu-menu-item v-for="item in groups" :key="item.leaderId" :value="item.leaderId" :title="item.leaderName"/>
      </mu-select-field>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import selectField from 'muse-components/selectField'
import {menuItem} from 'muse-components/menu'

Vue.component(selectField.name, selectField)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'Group',
  props: {
    handleChange: {
      type: Function,
      default: () => {}
    },
    changeCity: {
      type: Function,
      default: () => {}
    }
  },
  created () {
    this.getConfig()
  },
  computed: {
    ...mapState([
      'cities',
      'city',
      'groups',
      'group'
    ])
  },
  mounted () {
    // this.setCity(this.$refs.city.value)
    // if (!this.group) {
    //   this.setGroup(this.$refs.group && this.$refs.group.value)
    // }
  },
  methods: {
    ...mapActions([
      'getConfig'
    ]),
    ...mapMutations([
      'setCity',
      'setGroup'
    ]),
    handleChangeCity (v) {
      this.setCity(v)
      this.changeCity()
      this.handleChange()
    },
    handleChangeGroup (v) {
      this.setGroup(v)
      this.handleChange()
    }
  }
}
</script>
<style>
.city-select, .group-select {
  display: inline-block;
  height: 36px;
  margin-top: 5px;
  margin-left: 10px;
  padding: 0 10px;
  min-height: 36px;
}
.city-select-field, .group-select-field {
  width: 84px;
  top: -1px;
}
</style>

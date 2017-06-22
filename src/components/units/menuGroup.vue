<template>
  <div>
    <div v-if="citiesAndGroups" class="city-group-select">
      <mu-select-field v-model="selected" @change="handleChangeSelect" :icon="selected ? (selected.indexOf('-') > -1 ? 'group' : 'location_city') : 'public'" fullWidth>
        <mu-menu-item value="" title="全平台" leftIcon="public" class="city-group-select-menu"/>
        <mu-menu-item v-for="(el, index) in flattenGroup" :key="index" :value="el.value" :title="el.title" :leftIcon="el.level === 1 ? 'location_city' : 'group'" class="city-group-select-menu" :style="{marginLeft: el.level * 15 + 'px'}"/>
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
  name: 'MenuGroup',
  props: {
    handleChange: {
      type: Function,
      default: () => {}
    }
  },
  created () {
    this.getConfig()
  },
  computed: {
    ...mapState([
      'city',
      'group',
      'citiesAndGroups'
    ]),
    flattenGroup: function () {
      let arr = []
      this.citiesAndGroups.map(cg => {
        arr.push({
          value: cg.city.cityCode,
          title: cg.city.cityName,
          level: 1
        })
        cg.leaders.map(l => {
          arr.push({
            value: cg.city.cityCode + '-' + l.leaderId,
            title: l.leaderName,
            level: 2
          })
        })
      })
      return arr
    }
  },
  data () {
    return {
      selected: ''
    }
  },
  methods: {
    ...mapActions([
      'getConfig'
    ]),
    ...mapMutations([
      'setCity',
      'setGroup'
    ]),
    handleChangeSelect (v) {
      this.selected = v
      const ca = v.split('-')
      if (ca.length === 2) {
        this.setCity(ca[0])
        this.setGroup(Number(ca[1]))
      } else if (ca.length === 1) {
        this.setCity(ca[0])
        this.setGroup('')
      } else {
        this.setCity('')
        this.setGroup('')
      }
      this.handleChange()
    }
  }
}
</script>

<style>
.city-group-select-menu .mu-menu-item.have-left-icon {
  padding-left: 60px;
}
</style>
<style scoped>
.city-group-select {
  margin: 0 10px;
}
</style>

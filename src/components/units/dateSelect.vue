<template>
  <div>
    <div class="date-select">
      <mu-dropDown-menu
        v-if="showYear"
        :value="year"
        @change="handleChangeYear"
        id="yearDropDown"
      >
        <mu-menu-item value="2017" title="2017年" />
        <mu-menu-item value="2018" title="2018年" />
        <mu-menu-item value="2019" title="2019年" />
        <mu-menu-item value="2020" title="2020年" />
        <mu-menu-item value="2020" title="2021年" />
        <mu-menu-item value="2020" title="2022年" />
      </mu-dropDown-menu>
      <mu-dropDown-menu
        v-if="showMonth"
        :value="month"
        @change="handleChangeMonth"
        id="monthDropDown"
        :maxHeight="480"
      >
        <mu-menu-item v-if="showMonthAll" value="0" title="全年" />
        <mu-menu-item
          v-for="n in 12"
          :key="n"
          :value="n < 10 ? ('0' + n) : n.toString()"
          :title="n + '月'"
        />
      </mu-dropDown-menu>
      <mu-dropDown-menu
        v-if="showDate"
        :value="date"
        @change="handleChangeDate"
        id="dateDropDown"
        :maxHeight="480"
        :disabled="month === '0'"
      >
        <mu-menu-item v-if="showDateAll" value="0" title="全月" />
        <mu-menu-item
          v-for="n in (new Date(year, month, 0)).getDate()"
          :key="n"
          :value="n < 10 ? ('0' + n) : n.toString()"
          :title="n + '日'"
        />
      </mu-dropDown-menu>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import selectField from 'muse-components/selectField'
import {menuItem} from 'muse-components/menu'

Vue.component(selectField.name, selectField)
Vue.component(menuItem.name, menuItem)
export default {
  name: 'DateSelect',
  props: {
    handleChange: {
      type: Function,
      default: () => {}
    },
    showYear: {
      type: Boolean,
      default: true
    },
    showMonth: {
      type: Boolean,
      default: true
    },
    showDate: {
      type: Boolean,
      default: true
    },
    showMonthAll: {
      type: Boolean,
      default: true
    },
    showDateAll: {
      type: Boolean,
      default: true
    }
  },
  mounted () {
    const z = this
    if (z.month === '0' && z.showMonthAll === false) {
      z.handleChangeMonth('01')
    }
    if (z.date === '0' && z.showDateAll === false) {
      z.handleChangeDate('01')
    }
  },
  computed: {
    ...mapState([
      'year',
      'month',
      'date'
    ])
  },
  methods: {
    ...mapMutations([
      'setYear',
      'setMonth',
      'setDate'
    ]),
    handleChangeYear (v) {
      this.setYear(v)
      this.handleChange()
    },
    handleChangeMonth (v) {
      this.setMonth(v)
      if (v === '0') {
        this.setDate('0')
      }
      this.handleChange()
    },
    handleChangeDate (v) {
      this.setDate(v)
      this.handleChange()
    }
  }
}
</script>
<style scoped>
.date-select, .group-select {
  display: inline-block;
  height: 36px;
  margin-top: 5px;
  margin-left: 10px;
  padding: 0 10px;
  min-height: 36px;
}
.date-select-field, .group-select-field {
  width: 84px;
  top: -1px;
}
#yearDropDown {
  margin-right: -34px;
}
</style>

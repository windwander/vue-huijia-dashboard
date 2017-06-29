<template>
  <div :class="{'drawer-opened': openDrawer}">
    <MainMenu title="产品管理" />
    <div id="mainContent">
    </div>
    <!--<mu-snackbar v-if="snackbar" :message="snackbarMsg" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar"/>-->
  </div>
</template>
<script>
// import Vue from 'vue'
import { mapState } from 'vuex'
import MainMenu from '../units/mainMenu'

export default {
  name: 'ProductList',
  components: {
    MainMenu
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  computed: {
    ...mapState([
      'openDrawer'
    ])
  },
  watch: {
  },
  methods: {}
}
</script>

<style scoped>
</style>

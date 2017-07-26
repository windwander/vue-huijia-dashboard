<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
html {
  height: 100%;
}
body {
  min-height: 100%;
}
#app {
  font-family: "Hiragino Sans GB", "Lucida Grande", "微软雅黑", Helvetica, Arial, sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100%;
}
/* MuseUI 修改样式 */
.mu-popover>.mu-menu {
  min-width: 80px;
  width: auto !important;
}
.mu-popover>.mu-menu>.mu-menu-list {
  max-height: 80vh;
}
</style>

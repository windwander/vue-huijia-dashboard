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
html, body, #app {
  font-family: "Hiragino Sans GB", "Lucida Grande", "微软雅黑", Helvetica, Arial, sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 620px;
  min-width: 1330px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
/* MuseUI 修改样式 */
.mu-popover>.mu-menu {
  min-width: 80px;
  width: auto !important;
}
</style>

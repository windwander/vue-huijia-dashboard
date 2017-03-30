<template>
  <div class="">
    <mu-avatar slot="left" :icon="icon" :src="src" color="Indigo" imgClass="imageSize" iconClass="avatar-icon" class="head-avatar" backgroundColor="white" :size="size" :iconSize="iconSize"/>
  </div>
</template>
<script>
import Vue from 'vue'
import avatar from 'muse-components/avatar'

Vue.component(avatar.name, avatar)
export default {
  name: 'avatar',
  props: {
    src: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 52
    }
  },
  data () {
    return {
      icon: this.src.length ? '' : 'account_circle',
      iconSize: this.size
    }
  }
}
</script>
<style>
.head-avatar {
  box-shadow: 0px 0px 10px 0px #757575;
  padding: 6px;
}
/*.avatar-icon {}
.avatar-img {}*/
</style>

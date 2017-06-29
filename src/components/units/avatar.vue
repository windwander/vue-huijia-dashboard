<template>
  <div class="">
    <mu-avatar v-if="this.src.length" slot="left" :src="src" color="Indigo" imgClass="imageSize" iconClass="avatar-icon" class="head-avatar" backgroundColor="white" :size="size"/>
    <mu-avatar v-else slot="left" :icon="icon" color="Indigo" imgClass="imageSize" iconClass="avatar-icon" class="head-avatar" backgroundColor="white":iconSize="iconSize"/>
  </div>
</template>
<script>
import Vue from 'vue'
import avatar from 'muse-components/avatar'

Vue.component(avatar.name, avatar)
export default {
  name: 'Avatar',
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
      iconSize: this.src.length ? 0 : this.size
    }
  }
}
</script>
<style scoped>
.head-avatar {
  box-shadow: 0px 0px 10px 0px #757575;
}
.mu-avatar {
  height: auto;
  width: auto;
}
/*.avatar-icon {}
.avatar-img {}*/
</style>

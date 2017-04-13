<template>
<div class="login-outer">
<mu-paper class="login-box">
  <h1>运营地图登录</h1>
  <mu-text-field label="用户名" labelFloat v-model="phone" /><br/>
  <mu-text-field label="密码" labelFloat type="password" v-model="password" /><br/>
  <mu-raised-button label="登录" class="raised-button" @click="login()" secondary/>
</mu-paper>
</div>
</template>
<script>
import Vue from 'vue'
import paper from 'muse-components/paper'
import textField from 'muse-components/textField'
import raisedButton from 'muse-components/raisedButton'
// import icon from 'muse-components/icon';

Vue.component(paper.name, paper)
Vue.component(textField.name, textField)
Vue.component(raisedButton.name, raisedButton)
export default {
  name: 'Login',
  data () {
    return {
      phone: '',
      password: ''
    }
  },
  methods: {
    login: function () {
      this.$store.dispatch('doLogin', {
        phone: this.phone,
        password: this.password
      })
      // this.$store.dispatch('getOverallCount')
    }
  }
}
</script>
<style scoped>
.login-outer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  min-height: 400px;
  background-image: radial-gradient(rgba(255,255,255,0.5),rgba(71,74,79,0.8));
}
.login-box {
  min-width: 360px;
  padding: 3em;
  margin: 3em;
}
</style>

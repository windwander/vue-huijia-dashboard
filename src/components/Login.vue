<template>
  <div class="login-outer">
    <vue-particles
      class="login-particles"
      color="#dedede"
      :particleOpacity="0.8"
      :particlesNumber="60"
      shapeType="circle"
      :particleSize="4"
      linesColor="#dedede"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.4"
      :linesDistance="160"
      :moveSpeed="3"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="push"
    />
    <mu-paper class="login-box">
      <h1>运营管理平台登录</h1>
      <mu-text-field label="用户名" labelFloat v-model="phone" fullWidth/>
      <br/>
      <mu-text-field label="密码" labelFloat type="password" v-model="password" ref="passwordField" fullWidth/>
      <br/>
      <mu-raised-button label="登录" class="raised-button" @click="login()" secondary fullWidth/>
      <p v-if="errorLogin">{{errorLogin.message}}</p>
    </mu-paper>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import paper from 'muse-components/paper'
import textField from 'muse-components/textField'
import raisedButton from 'muse-components/raisedButton'
import VueParticles from './units/vue-particles'

Vue.component(paper.name, paper)
Vue.component(textField.name, textField)
Vue.component(raisedButton.name, raisedButton)
Vue.component(VueParticles.name, VueParticles)
export default {
  name: 'Login',
  data () {
    return {
      phone: '',
      password: ''
    }
  },
  computed: {
    ...mapState([
      'errorLogin'
    ])
  },
  methods: {
    login: function () {
      this.$store.dispatch('doLogin', {
        phone: this.phone,
        password: this.password
      })
    }
  },
  mounted () {
    const z = this
    const input = z.$refs.passwordField.$el.querySelector('input')
    input.addEventListener('keyup', function (event) {
      if (event.keyCode === 13) {
        z.login()
      }
    })
  }
}
</script>
<style scoped>
.login-outer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-image: radial-gradient(rgba(255, 255, 255, 0.5), rgba(71, 74, 79, 0.8));
}
.login-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.login-box {
  min-width: 360px;
  padding: 3em;
  padding-top: calc(120px + 3em);
  margin: 3em;
  background: url(../../static/logo.png) #fff center 3em no-repeat;
  background-size: 120px;
  z-index: 10;
}

.login-box h1 {
  margin-top: 0;
  font-size: 1.8em;
}

.raised-button {
  margin: 10px 0;
}
</style>

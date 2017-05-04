import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import List from '@/components/List'
import FixCalc from '@/components/FixCalc'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }, {
      path: '/login',
      name: 'Login',
      component: Login
    }, {
      path: '/list',
      name: 'List',
      component: List
    }, {
      path: '/fixCalc',
      name: 'fixCalc',
      component: FixCalc
    }
  ]
})

import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import List from '@/components/List'
import SettleList from '@/components/SettleList'
import overallChart from '@/components/overallChart'
import compareChart from '@/components/compareChart'
import workerVerify from '@/components/workerVerify'
import workerManage from '@/components/workerManage'

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
      path: '/settleList',
      name: 'settleList',
      component: SettleList
    }, {
      path: '/overallChart',
      name: 'overallChart',
      component: overallChart
    }, {
      path: '/compareChart',
      name: 'compareChart',
      component: compareChart
    }, {
      path: '/workerVerify',
      name: 'workerVerify',
      component: workerVerify
    }, {
      path: '/workerManage',
      name: 'workerManage',
      component: workerManage
    }
  ]
})

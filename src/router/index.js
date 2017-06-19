import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import store from '../store/index.js'

Vue.use(Router)

const bonusList = () => import('@/components/List.vue')
const settleList = () => import('@/components/settleList.vue')
const overallChart = () => import('@/components/overallChart.vue')
const compareChart = () => import('@/components/compareChart.vue')
const workerVerify = () => import('@/components/workerVerify.vue')
const workerManage = () => import('@/components/workerManage.vue')

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
      component: bonusList,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray.bonusList) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/settleList',
      name: 'settleList',
      component: settleList,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray.settleList) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/overallChart',
      name: 'overallChart',
      component: overallChart,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray.overallChart) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/compareChart',
      name: 'compareChart',
      component: compareChart,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray.compareChart) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/workerVerify',
      name: 'workerVerify',
      component: workerVerify,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray.workerVerify) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/workerManage',
      name: 'workerManage',
      component: workerManage,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray.workerManage) {
          next()
        } else {
          next(false)
        }
      }
    }
  ]
})

import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import store from '../store/index.js'

Vue.use(Router)
/* 订单 */
const orderChart = () => import('@/components/order/chart.vue')
const orderList = () => import('@/components/order/list.vue')
/* 产品 */
const productChart = () => import('@/components/product/chart.vue')
const productList = () => import('@/components/product/list.vue')
/* 美车师 */
const workerChart = () => import('@/components/worker/chart.vue')
const workerList = () => import('@/components/worker/list.vue')
const workerVerify = () => import('@/components/worker/verify.vue')
/* 收入 */
const incomeChart = () => import('@/components/income/chart.vue')
const incomeList = () => import('@/components/income/list.vue')
/* 结算 */
const balanceConfig = () => import('@/components/balance/config.vue')
const balanceList = () => import('@/components/balance/list.vue')

// const bonusList = () => import('@/components/List.vue')
// const settleList = () => import('@/components/settleList.vue')
// const overallChart = () => import('@/components/overallChart.vue')
// const compareChart = () => import('@/components/compareChart.vue')
// const workerVerify = () => import('@/components/workerVerify.vue')
// const workerManage = () => import('@/components/workerManage.vue')

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
      path: '/order/chart',
      name: 'orderChart',
      component: orderChart,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/order/list',
      name: 'orderList',
      component: orderList,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/product/chart',
      name: 'productChart',
      component: productChart,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/product/list',
      name: 'productList',
      component: productList,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/worker/chart',
      name: 'workerChart',
      component: workerChart,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/worker/list',
      name: 'workerList',
      component: workerList,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/worker/verify',
      name: 'workerVerify',
      component: workerVerify,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/income/chart',
      name: 'incomeChart',
      component: incomeChart,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/income/list',
      name: 'incomeList',
      component: incomeList,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/balance/config',
      name: 'balanceConfig',
      component: balanceConfig,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }, {
      path: '/balance/list',
      name: 'balanceList',
      component: balanceList,
      beforeEnter: (to, from, next) => {
        if (store.getters.menusArray) {
          next()
        } else {
          next(false)
        }
      }
    }
  ]
})

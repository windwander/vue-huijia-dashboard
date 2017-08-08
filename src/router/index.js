import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/map/home'
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
/* 结算 */
const balanceConfig = () => import('@/components/balance/config.vue')
const balanceList = () => import('@/components/balance/list.vue')

/* 进入路由前的权限判断 */
function permissionChecker (next, permissionName) {
  function resolveRouter () {
    if (store.getters.menusArray[permissionName]) {
      next()
    } else {
      next(false)
    }
  }
  if (Object.getOwnPropertyNames(store.getters.menusArray).length === 0) {
    store.dispatch('getMenu').then(function () {
      resolveRouter()
    })
  } else {
    resolveRouter()
  }
}

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
        permissionChecker(next, 'orderChart')
      }
    }, {
      path: '/order/list',
      name: 'orderList',
      component: orderList,
      beforeEnter: (to, from, next) => {
        permissionChecker(next, 'orderList')
      }
    }, {
      path: '/product/chart',
      name: 'productChart',
      component: productChart,
      beforeEnter: (to, from, next) => {
        permissionChecker(next, 'productChart')
      }
    }, {
      path: '/product/list',
      name: 'productList',
      component: productList,
      beforeEnter: (to, from, next) => {
        permissionChecker(next, 'productList')
      }
    }, {
      path: '/worker/chart',
      name: 'workerChart',
      component: workerChart,
      beforeEnter: (to, from, next) => {
        permissionChecker(next, 'workerChart')
      }
    }, {
      path: '/worker/list',
      name: 'workerList',
      component: workerList,
      beforeEnter: (to, from, next) => {
        permissionChecker(next, 'workerList')
      }
    }, {
      path: '/worker/verify',
      name: 'workerVerify',
      component: workerVerify,
      beforeEnter: (to, from, next) => {
        permissionChecker(next, 'workerVerify')
      }
    }, {
      path: '/income/chart',
      name: 'incomeChart',
      component: incomeChart,
      beforeEnter: (to, from, next) => {
        permissionChecker(next, 'incomeChart')
      }
    }, {
      path: '/balance/config',
      name: 'balanceConfig',
      component: balanceConfig,
      beforeEnter: (to, from, next) => {
        permissionChecker(next, 'balanceConfig')
      }
    }, {
      path: '/balance/list',
      name: 'balanceList',
      component: balanceList,
      beforeEnter: (to, from, next) => {
        permissionChecker(next, 'balanceList')
      }
    }
  ]
})

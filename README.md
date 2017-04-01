# vue-dashboard

> 运营地图视图

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## 主要的开源组件

[Vue.js](http://cn.vuejs.org/)

[Muse UI](http://www.muse-ui.org)

[Webpack](http://vuejs-templates.github.io/webpack/)

[高德地图（javascript-api）](http://lbs.amap.com/api/javascript-api/summary/)

## 需要注意的地方

### 1. 使用了[axios](https://github.com/mzabriskie/axios)替代[Vue.js](http://cn.vuejs.org/)的原生ajax
文件main.js中：

``` javascript
Vue.prototype.$ajax = axios
```

### 2. 自带的proxy转发
在文件config/index.js中：

``` javascript
proxyTable: {
  '/api': {
    target: 'http://172.16.128.165/',
    changeOrigin: true,
    pathRewrite: {
      '^/api': ''
    }
  }
}
```

### 3. 引入高德地图javascript-api
在文件index.html中：

``` html
<script type="text/javascript" src="//webapi.amap.com/maps?v=1.3&key=49368279e2c8940219e4c54acd3081e8"></script>
```

在文件build/webpack.base.conf.js中：

``` javascript
externals: {
  "AMap": "AMap"
}
```

### 4. 部署路径设置为了二级目录([http://***/map]())
在文件config/index.js中：


``` javascript
assetsPublicPath: '/map'
```

同时注意引用图片地址时要使用**相对路径**

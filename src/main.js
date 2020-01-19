import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import './proxy'
// import '../myVue2'
import './newProxy'
import '../myVue3'
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App) // App 模块 组件vnode
}).$mount('#app')

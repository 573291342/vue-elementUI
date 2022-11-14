import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import store from './store'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/global.css'
import treeTable from 'vue-table-with-tree-grid'
//导入axios
import axios from 'axios';
//导入富文本
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器所需的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //必须return config
  return config
})
//使用富文本组件
Vue.use(VueQuillEditor, /* { default global options } */)
//注册树形结构组件
Vue.component('tree-table', treeTable)

Vue.config.productionTip = false
Vue.prototype.$http = axios

//全局时间过滤器
Vue.filter('dataFormat', (originVal) => {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

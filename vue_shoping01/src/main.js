import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
//导入全局配置
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
axios.interceptors.request.use(config => {

    console.log(config);
    config.headers.Authorization = window.sessionStorage.getItem("token")
    return config;
})
const app = createApp(App)
app.use(ElementPlus)
app.use(VueAxios, axios)
app.use(router).mount('#app')
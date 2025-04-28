import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue';
import { createPinia } from 'pinia'
// import 'ant-design-vue/dist/antd.css';

// 初始化Vue应用
const app = createApp(App)
app.use(router)
app.use(Antd)
app.use(createPinia())
// 挂载应用到 #app 元素
app.mount('#app')
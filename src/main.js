import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 初始化Vue应用
const app = createApp(App)
app.use(router)

// 挂载应用到 #app 元素
app.mount('#app')
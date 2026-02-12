import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import router from './router'
// 导入 SVG 图标注册
import 'virtual:svg-icons-register'
// 全局注册icon组件
import SvgIcon from './components/SvgIcon.vue'

const app = createApp(App);

app.use(pinia);
app.use(router);
app.component('SvgIcon', SvgIcon);
app.mount("#app");
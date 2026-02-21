import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import router from './router'
import '@/assets/css/global.scss'
import "@/assets/css/nprogress.css"
// 导入 SVG 图标注册
import 'virtual:svg-icons-register'
// 全局注册icon组件
import SvgIcon from './components/SvgIcon.vue'
import { useSettingsStore } from './stores/modules/settings'
// 语言切换工具
import i18n from './locale'
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18n)
app.component('SvgIcon', SvgIcon);
app.mount("#app");

// 初始化主题（必须在 pinia 和 mount 之后）
const settingsStore = useSettingsStore();
settingsStore.initTheme();
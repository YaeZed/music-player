import { createRouter, createWebHistory } from "vue-router";
import NProgress from "nprogress";
import Home from "@/views/Home.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "home",
            component: Home,
        },
        // ... 其他路由
    ],
});

// 配置 NProgress
NProgress.configure({
    showSpinner: false, // 不显示旋转图标
    trickleSpeed: 100, // 进度条速度
});

// 路由守卫：开始加载
router.beforeEach((to, from, next) => {
    NProgress.start();
    next();
});

// 路由守卫：加载完成
router.afterEach(() => {
    NProgress.done();
});
export default router;
# CSS 架构迁移教程（方案一）

> **目标**：将原项目的 CSS 架构完整迁移到 Vue 3 项目，保持一致的样式系统和主题切换功能

---

## 📋 迁移内容

我们将迁移：

- ✅ CSS 变量系统（主题颜色）
- ✅ 全局样式（global.scss）
- ✅ 自定义字体（Barlow 字体族）
- ✅ 第三方组件样式（nprogress）
- ✅ 主题切换机制（亮色/暗色）

---

## Step 1: 创建 CSS 目录结构

在你的 Vue 3 项目中创建目录：

```bash
# 在项目根目录执行
mkdir -p src/assets/css
mkdir -p src/assets/fonts
```

或手动创建：

```
src/
├── assets/
│   ├── css/      ← 新建
│   └── fonts/    ← 新建
```

---

## Step 2: 复制 CSS 文件

### Step 2.1: 复制 global.scss

**创建文件**：`src/assets/css/global.scss`

```scss
// =====================================
// 字体定义
// =====================================

@font-face {
  font-family: "Barlow";
  font-weight: normal;
  src:
    url("@/assets/fonts/Barlow-Regular.woff2") format("woff2"),
    url("@/assets/fonts/Barlow-Regular.ttf") format("truetype");
}

@font-face {
  font-family: "Barlow";
  font-weight: 500;
  src:
    url("@/assets/fonts/Barlow-Medium.woff2") format("woff2"),
    url("@/assets/fonts/Barlow-Medium.ttf") format("truetype");
}

@font-face {
  font-family: "Barlow";
  font-weight: 600;
  src:
    url("@/assets/fonts/Barlow-SemiBold.woff2") format("woff2"),
    url("@/assets/fonts/Barlow-SemiBold.ttf") format("truetype");
}

@font-face {
  font-family: "Barlow";
  font-weight: bold;
  src:
    url("@/assets/fonts/Barlow-Bold.woff2") format("woff2"),
    url("@/assets/fonts/Barlow-Bold.ttf") format("truetype");
}

@font-face {
  font-family: "Barlow";
  font-weight: 800;
  src:
    url("@/assets/fonts/Barlow-ExtraBold.woff2") format("woff2"),
    url("@/assets/fonts/Barlow-ExtraBold.ttf") format("truetype");
}

@font-face {
  font-family: "Barlow";
  font-weight: 900;
  src:
    url("@/assets/fonts/Barlow-Black.woff2") format("woff2"),
    url("@/assets/fonts/Barlow-Black.ttf") format("truetype");
}

// =====================================
// CSS 变量 - 亮色主题（默认）
// =====================================

:root {
  /* 背景颜色 */
  --color-body-bg: #ffffff;

  /* 文本颜色 */
  --color-text: #000;

  /* 主色调（蓝色） */
  --color-primary: #335eea;
  --color-primary-bg: #eaeffd;
  --color-primary-bg-for-transparent: rgba(189, 207, 255, 0.28);

  /* 次要颜色（灰色） */
  --color-secondary: #7a7a7b;
  --color-secondary-bg: #f5f5f7;
  --color-secondary-bg-for-transparent: rgba(209, 209, 214, 0.28);

  /* 导航栏背景（半透明） */
  --color-navbar-bg: rgba(255, 255, 255, 0.86);

  /* 滚动条样式 */
  --html-overflow-y: overlay;
}

// =====================================
// CSS 变量 - 暗色主题
// =====================================

[data-theme="dark"] {
  /* 背景颜色 */
  --color-body-bg: #222222;

  /* 文本颜色 */
  --color-text: #ffffff;

  /* 主色调（蓝色） */
  --color-primary: #335eea;
  --color-primary-bg: #bbcdff;
  --color-primary-bg-for-transparent: rgba(255, 255, 255, 0.12);

  /* 次要颜色（灰色） */
  --color-secondary: #7a7a7b;
  --color-secondary-bg: #323232;
  --color-secondary-bg-for-transparent: rgba(255, 255, 255, 0.08);

  /* 导航栏背景（半透明） */
  --color-navbar-bg: rgba(34, 34, 34, 0.86);
}

// =====================================
// 全局基础样式
// =====================================

#app,
input {
  font-family:
    "Barlow",
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Helvetica Neue",
    "PingFang SC",
    "Microsoft YaHei",
    "Source Han Sans SC",
    "Noto Sans CJK SC",
    "WenQuanYi Micro Hei",
    sans-serif;
}

html {
  overflow-y: var(--html-overflow-y);
  min-width: 768px;
  overscroll-behavior: none;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--color-body-bg);
  color: var(--color-text);
  transition:
    background-color 0.3s,
    color 0.3s;
}

// =====================================
// 基础元素样式重置
// =====================================

select,
button {
  font-family: inherit;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  user-select: none;
  color: inherit;

  &:focus {
    outline: none;
  }
}

input {
  &:focus {
    outline: none;
  }
}

a {
  color: inherit;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

// =====================================
// 自定义滚动条
// =====================================

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-left: 1px solid rgba(128, 128, 128, 0.18);
  background: var(--color-body-bg);
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(128, 128, 128, 0.38);
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: var(--color-secondary-bg);
}

// =====================================
// 工具类
// =====================================

.user-select-none {
  user-select: none;
}
```

---

### Step 2.2: 复制 nprogress.css

**创建文件**：`src/assets/css/nprogress.css`

```css
/* 
 * NProgress 进度条样式
 * 用于页面加载时的顶部进度条
 */

/* 让点击事件穿透 */
#nprogress {
  pointer-events: none;
}

/* 进度条主体 */
#nprogress .bar {
  background: #335eea;
  position: fixed;
  z-index: 1031;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
}

/* 进度条末端的光效 */
#nprogress .peg {
  display: block;
  position: absolute;
  right: 0px;
  width: 100px;
  height: 100%;
  box-shadow:
    0 0 10px #335eea,
    0 0 5px #335eea;
  opacity: 1;
  -webkit-transform: rotate(3deg) translate(0px, -4px);
  -ms-transform: rotate(3deg) translate(0px, -4px);
  transform: rotate(3deg) translate(0px, -4px);
}

/* 自定义父容器 */
.nprogress-custom-parent {
  overflow: hidden;
  position: relative;
}

.nprogress-custom-parent #nprogress .bar {
  position: absolute;
}
```

---

## Step 3: 复制字体文件

### Step 3.1: 从原项目复制字体

**手动复制**以下文件：

从 `d:\github_projects\YesPlayMusic\src\assets\fonts\` 复制到你的项目 `src/assets/fonts/`：

```
需要复制的文件（12个）：
✅ Barlow-Regular.woff2
✅ Barlow-Regular.ttf
✅ Barlow-Medium.woff2
✅ Barlow-Medium.ttf
✅ Barlow-SemiBold.woff2
✅ Barlow-SemiBold.ttf
✅ Barlow-Bold.woff2
✅ Barlow-Bold.ttf
✅ Barlow-ExtraBold.woff2
✅ Barlow-ExtraBold.ttf
✅ Barlow-Black.woff2
✅ Barlow-Black.ttf
```

**复制命令**（Windows PowerShell）：

```powershell
# 在项目根目录执行
Copy-Item "d:\github_projects\YesPlayMusic\src\assets\fonts\*" -Destination ".\src\assets\fonts\" -Recurse
```

---

## Step 4: 在 main.ts 中引入全局样式

### Step 4.1: 修改 main.ts

**修改文件**：`src/main.ts`

```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";

// ✅ 引入全局样式
import "@/assets/css/global.scss";
import "@/assets/css/nprogress.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount("#app");
```

---

## Step 5: 配置 Vite 支持 @ 别名

### Step 5.1: 修改 vite.config.ts

**修改文件**：`vite.config.ts`

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ 配置 @ 别名
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // 如果需要全局导入变量，可以在这里配置
        // additionalData: `@import "@/assets/css/variables.scss";`
      },
    },
  },
});
```

### Step 5.2: 安装 @types/node

```bash
npm install -D @types/node
```

---

## Step 6: 创建主题管理 Store

### Step 6.1: 创建 settings Store

**创建文件**：`src/stores/settings.ts`

```typescript
import { defineStore } from "pinia";
import { ref, watch } from "vue";

/**
 * 设置 Store
 * 管理应用设置，包括主题切换
 */
export const useSettingsStore = defineStore("settings", () => {
  // =====================================
  // State
  // =====================================

  const theme = ref<"light" | "dark">("light");

  // =====================================
  // Actions
  // =====================================

  /**
   * 初始化主题
   * 从 localStorage 读取用户上次选择的主题
   */
  function initTheme() {
    // 1. 从 localStorage 读取
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

    // 2. 如果有保存的主题，使用保存的；否则使用系统偏好
    if (savedTheme) {
      theme.value = savedTheme;
    } else {
      // 检测系统偏好
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      theme.value = prefersDark ? "dark" : "light";
    }

    // 3. 应用主题
    applyTheme(theme.value);

    console.log(`🎨 [Settings] Theme initialized: ${theme.value}`);
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    theme.value = theme.value === "light" ? "dark" : "light";
    console.log(`🎨 [Settings] Theme toggled to: ${theme.value}`);
  }

  /**
   * 应用主题到 DOM
   */
  function applyTheme(newTheme: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  // =====================================
  // Watchers
  // =====================================

  // 监听主题变化，自动保存并应用
  watch(theme, (newTheme) => {
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });

  // =====================================
  // Return
  // =====================================

  return {
    // State
    theme,

    // Actions
    initTheme,
    toggleTheme,
  };
});
```

---

## Step 7: 在应用启动时初始化主题

### Step 7.1: 修改 main.ts

**修改文件**：`src/main.ts`（扩展）

```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import { useSettingsStore } from "@/stores/settings"; // ✅ 导入

// 引入全局样式
import "@/assets/css/global.scss";
import "@/assets/css/nprogress.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount("#app");

// ✅ 初始化主题（必须在 pinia 和 app.mount 之后）
const settingsStore = useSettingsStore();
settingsStore.initTheme();
```

---

## Step 8: 创建主题切换组件

### Step 8.1: 创建 ThemeToggle 组件

**创建文件**：`src/components/ThemeToggle.vue`

```vue
<template>
  <button class="theme-toggle" @click="toggleTheme" :title="themeLabel">
    <span class="icon">{{ themeIcon }}</span>
    <span class="label">{{ themeLabel }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { storeToRefs } from "pinia";

const settingsStore = useSettingsStore();
const { theme } = storeToRefs(settingsStore);
const { toggleTheme } = settingsStore;

/**
 * 主题图标
 */
const themeIcon = computed(() => {
  return theme.value === "light" ? "🌙" : "☀️";
});

/**
 * 主题标签
 */
const themeLabel = computed(() => {
  return theme.value === "light" ? "暗色模式" : "亮色模式";
});
</script>

<style scoped lang="scss">
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--color-secondary-bg);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    background: var(--color-primary-bg);
    color: var(--color-primary);
    transform: translateY(-2px);
  }

  .icon {
    font-size: 18px;
  }

  .label {
    @media (max-width: 768px) {
      display: none;
    }
  }
}
</style>
```

---

## Step 9: 在页面中使用主题切换

### Step 9.1: 修改 Home.vue（示例）

**修改文件**：`src/views/Home.vue`

```vue
<template>
  <div class="home">
    <!-- 主题切换按钮 -->
    <div class="header">
      <h1>YesPlayMusic</h1>
      <ThemeToggle />
    </div>

    <!-- 其他内容 -->
    <div class="content">
      <p>主页内容</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from "@/components/ThemeToggle.vue";
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  padding: 20px;
  background: var(--color-body-bg); // ✅ 使用 CSS 变量
  color: var(--color-text); // ✅ 使用 CSS 变量
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;

  h1 {
    font-size: 32px;
    font-weight: 800;
    color: var(--color-primary); // ✅ 使用主色调
  }
}

.content {
  padding: 20px;
  background: var(--color-secondary-bg); // ✅ 使用次要背景色
  border-radius: 12px;
}
</style>
```

---

## Step 10: 添加 NProgress 配置（可选）

如果你想使用页面加载进度条：

### Step 10.1: 安装 nprogress

```bash
npm install nprogress
npm install -D @types/nprogress
```

### Step 10.2: 在路由中使用

**修改文件**：`src/router/index.ts`

```typescript
import { createRouter, createWebHistory } from "vue-router";
import NProgress from "nprogress"; // ✅ 导入
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

// ✅ 配置 NProgress
NProgress.configure({
  showSpinner: false, // 不显示旋转图标
  trickleSpeed: 100, // 进度条速度
});

// ✅ 路由守卫：开始加载
router.beforeEach((to, from, next) => {
  NProgress.start();
  next();
});

// ✅ 路由守卫：加载完成
router.afterEach(() => {
  NProgress.done();
});

export default router;
```

---

## ✅ 测试验证

### 1. 检查文件结构

确认你已创建这些文件：

```
src/
├── assets/
│   ├── css/
│   │   ├── global.scss       ✅
│   │   └── nprogress.css     ✅
│   └── fonts/
│       ├── Barlow-Regular.woff2    ✅
│       ├── Barlow-Regular.ttf      ✅
│       └── ... (其他10个字体文件)
├── stores/
│   └── settings.ts           ✅
├── components/
│   └── ThemeToggle.vue       ✅
└── main.ts                   ✅ (已修改)
```

### 2. 启动项目

```bash
npm run dev
```

### 3. 测试主题切换

1. **打开浏览器**：访问 http://localhost:5173
2. **点击主题切换按钮**：应该看到页面颜色变化
3. **检查元素**：
   - 打开开发者工具
   - 查看 `<html>` 元素，应该有 `data-theme="dark"` 或 `data-theme="light"` 属性
4. **刷新页面**：主题应该保持（从 localStorage 读取）

### 4. 测试 CSS 变量

在浏览器控制台执行：

```javascript
// 获取 CSS 变量值
getComputedStyle(document.documentElement).getPropertyValue("--color-body-bg");
// 亮色模式应该返回: "#ffffff"
// 暗色模式应该返回: "#222222"
```

### 5. 测试字体

在开发者工具中：

1. 打开 **Network** 标签
2. 过滤 **Font** 类型
3. 刷新页面
4. 应该看到 Barlow 字体文件加载成功

### 6. 测试滚动条

创建一个长页面，检查滚动条样式：

- 宽度应该是 8px
- 颜色随主题变化

---

## 🎨 CSS 变量使用指南

### 常用 CSS 变量

在组件中使用这些变量：

```scss
.your-component {
  /* 背景 */
  background: var(--color-body-bg);
  background: var(--color-primary-bg);
  background: var(--color-secondary-bg);

  /* 文本 */
  color: var(--color-text);
  color: var(--color-primary);
  color: var(--color-secondary);

  /* 半透明背景 */
  background: var(--color-primary-bg-for-transparent);
  background: var(--color-secondary-bg-for-transparent);
}
```

### 完整变量列表

| 变量名                 | 用途       | 亮色值                 | 暗色值              |
| ---------------------- | ---------- | ---------------------- | ------------------- |
| `--color-body-bg`      | 页面背景   | #ffffff                | #222222             |
| `--color-text`         | 文本颜色   | #000                   | #ffffff             |
| `--color-primary`      | 主色调     | #335eea                | #335eea             |
| `--color-primary-bg`   | 主色背景   | #eaeffd                | #bbcdff             |
| `--color-secondary`    | 次要颜色   | #7a7a7b                | #7a7a7b             |
| `--color-secondary-bg` | 次要背景   | #f5f5f7                | #323232             |
| `--color-navbar-bg`    | 导航栏背景 | rgba(255,255,255,0.86) | rgba(34,34,34,0.86) |

---

## 🚀 下一步

现在你已经成功迁移了 CSS 架构！你可以：

1. **在所有组件中使用 CSS 变量**
2. **添加更多主题**（如：粉色主题、绿色主题）
3. **自定义颜色**（修改 `:root` 中的变量值）
4. **添加动画过渡**（已添加 `transition` 到 body）

---

**恭喜完成 CSS 架构迁移！** 🎉

你的项目现在拥有：

- ✅ 完整的主题系统
- ✅ 自定义字体
- ✅ 统一的样式变量
- ✅ 优雅的暗色模式

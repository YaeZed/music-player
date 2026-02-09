# Step-by-Step Demo 教程（从 Step 3 开始）

> **前置条件**：你已经完成了 Step 2.2（API 层重构）  
> **目标**：完成 Service → Store → Composable → View 层，跑通播放歌曲的完整功能

---

## 📋 当前进度检查

你应该已经有这些文件：

```
src/
├── api/
│   ├── request.ts       ✅ 已完成
│   └── track.ts         ✅ 已完成
├── types/
│   └── track.ts         ✅ 已完成
```

现在我们继续添加剩余部分！

---

## Step 3: Service 层搭建（音频服务）

### Step 3.1: 创建 AudioService

**创建文件**：`src/services/AudioService.ts`

```typescript
import { Howl, Howler } from "howler";

/**
 * 音频播放服务
 *
 * 职责：
 * - 封装 Howler.js，提供统一的播放接口
 * - 管理音频实例的生命周期
 * - 处理播放、暂停、进度控制
 */
export class AudioService {
  private howler: Howl | null = null;
  private currentUrl: string = "";

  /**
   * 播放音频
   * @param url - 音频 URL
   */
  async play(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 如果是相同的 URL，直接恢复播放
      if (this.currentUrl === url && this.howler) {
        this.howler.play();
        resolve();
        return;
      }

      // 卸载之前的音频
      this.unload();
      this.currentUrl = url;

      console.log("🎵 [AudioService] Playing:", url);

      // 创建新的 Howl 实例
      this.howler = new Howl({
        src: [url],
        html5: true, // 使用 HTML5 Audio（适合流媒体）
        format: ["mp3"], // 支持的格式

        onload: () => {
          console.log("✅ [AudioService] Audio loaded successfully");
          resolve();
        },

        onloaderror: (id, error) => {
          console.error("❌ [AudioService] Load error:", error);
          reject(new Error("音频加载失败"));
        },

        onplayerror: (id, error) => {
          console.error("❌ [AudioService] Play error:", error);
          reject(new Error("音频播放失败"));
        },
      });

      // 开始播放
      this.howler.play();
    });
  }

  /**
   * 暂停播放
   */
  pause(): void {
    if (this.howler) {
      this.howler.pause();
      console.log("⏸️ [AudioService] Paused");
    }
  }

  /**
   * 恢复播放
   */
  resume(): void {
    if (this.howler) {
      this.howler.play();
      console.log("▶️ [AudioService] Resumed");
    }
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.howler) {
      this.howler.stop();
      console.log("⏹️ [AudioService] Stopped");
    }
  }

  /**
   * 获取播放状态
   */
  isPlaying(): boolean {
    return this.howler?.playing() ?? false;
  }

  /**
   * 设置音量
   * @param volume - 音量值（0-1）
   */
  setVolume(volume: number): void {
    if (this.howler) {
      this.howler.volume(Math.max(0, Math.min(1, volume)));
    }
  }

  /**
   * 获取当前播放进度（秒）
   */
  getCurrentTime(): number {
    return this.howler?.seek() ?? 0;
  }

  /**
   * 跳转到指定时间
   * @param time - 时间（秒）
   */
  seek(time: number): void {
    if (this.howler) {
      this.howler.seek(time);
    }
  }

  /**
   * 卸载音频实例
   *
   * 为什么需要手动卸载？
   * - Howler 不会自动销毁实例
   * - 不卸载会导致内存泄漏
   */
  unload(): void {
    if (this.howler) {
      this.howler.unload();
      this.howler = null;
      this.currentUrl = "";
      console.log("🗑️ [AudioService] Audio unloaded");
    }
  }
}

// 导出单例
export const audioService = new AudioService();
```

**测试代码**（在浏览器控制台测试）：

```typescript
import { audioService } from "@/services/AudioService";

// 测试播放（使用一个公开的音频 URL）
audioService
  .play("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")
  .then(() => console.log("播放成功"))
  .catch((err) => console.error("播放失败:", err));

// 测试暂停
// audioService.pause()

// 测试恢复
// audioService.resume()
```

---

## Step 4: Store 层重构（Pinia）

### Step 4.1: 创建 Pinia 实例

**创建文件**：`src/stores/index.ts`

```typescript
import { createPinia } from "pinia";

const pinia = createPinia();

export default pinia;
```

**修改文件**：`src/main.ts`（添加 Pinia）

```typescript
import { createApp } from "vue";
import pinia from "./stores"; // 👈 导入 Pinia
import App from "./App.vue";

const app = createApp(App);

app.use(pinia); // 👈 使用 Pinia
app.mount("#app");

console.log("🚀 App started with Pinia");
```

---

### Step 4.2: 创建 PlayerStore

**创建文件**：`src/stores/player.ts`

```typescript
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { audioService } from "@/services/AudioService";
import { getTrackDetail, getTrackUrl } from "@/api/track";
import type { Track } from "@/types/track";

/**
 * 播放器 Store
 *
 * 职责：
 * - 管理播放器全局状态（当前歌曲、播放状态等）
 * - 协调 API 和 AudioService
 * - 提供播放、暂停等操作方法
 */
export const usePlayerStore = defineStore("player", () => {
  // ============ State ============
  const playing = ref(false); // 是否正在播放
  const loading = ref(false); // 是否正在加载
  const currentTrack = ref<Track | null>(null); // 当前歌曲
  const errorMessage = ref(""); // 错误信息

  // ============ Getters ============
  /**
   * 当前歌曲 ID
   */
  const currentTrackId = computed(() => currentTrack.value?.id ?? null);

  /**
   * 当前歌曲名称
   */
  const currentTrackName = computed(() => currentTrack.value?.name ?? "未播放");

  /**
   * 当前歌手名称
   */
  const currentArtists = computed(() => {
    if (!currentTrack.value) return "";
    return currentTrack.value.artists.map((a) => a.name).join(" / ");
  });

  // ============ Actions ============
  /**
   * 播放指定歌曲
   * @param trackId - 歌曲 ID
   */
  async function playTrack(trackId: number) {
    try {
      loading.value = true;
      errorMessage.value = "";

      console.log("📀 [PlayerStore] Fetching track:", trackId);

      // 1. 获取歌曲详情
      const track = await getTrackDetail(trackId);
      currentTrack.value = track;
      console.log("✅ [PlayerStore] Track info loaded:", track.name);

      // 2. 获取播放 URL
      const url = await getTrackUrl(trackId);
      console.log("✅ [PlayerStore] Play URL loaded:", url);

      // 3. 播放音频
      await audioService.play(url);
      playing.value = true;

      console.log("🎉 [PlayerStore] Now playing:", track.name);
    } catch (error: any) {
      const message = error.message || "播放失败";
      errorMessage.value = message;
      console.error("❌ [PlayerStore] Play failed:", message);
      playing.value = false;
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 暂停播放
   */
  function pause() {
    audioService.pause();
    playing.value = false;
    console.log("⏸️ [PlayerStore] Paused");
  }

  /**
   * 恢复播放
   */
  function resume() {
    audioService.resume();
    playing.value = true;
    console.log("▶️ [PlayerStore] Resumed");
  }

  /**
   * 切换播放/暂停
   */
  function togglePlay() {
    if (playing.value) {
      pause();
    } else {
      resume();
    }
  }

  /**
   * 停止播放
   */
  function stop() {
    audioService.stop();
    playing.value = false;
    console.log("⏹️ [PlayerStore] Stopped");
  }

  // ============ 返回（导出）============
  return {
    // State
    playing,
    loading,
    currentTrack,
    errorMessage,

    // Getters
    currentTrackId,
    currentTrackName,
    currentArtists,

    // Actions
    playTrack,
    pause,
    resume,
    togglePlay,
    stop,
  };
});
```

**测试代码**（在浏览器控制台测试）：

```typescript
import { usePlayerStore } from "@/stores/player";

const playerStore = usePlayerStore();

// 测试播放（周杰伦 - 晴天）
playerStore
  .playTrack(186016)
  .then(() => console.log("播放成功"))
  .catch((err) => console.error("播放失败:", err));

// 查看状态
console.log("播放中:", playerStore.playing);
console.log("当前歌曲:", playerStore.currentTrackName);
```

---

## Step 5: Composable 层

### Step 5.1: 创建 usePlayer

**创建文件**：`src/composables/usePlayer.ts`

```typescript
import { storeToRefs } from "pinia";
import { usePlayerStore } from "@/stores/player";

/**
 * 播放器 Composable
 *
 * 为什么需要这个 Composable？
 * - 为组件提供简洁的 API（不需要直接操作 Store）
 * - 统一管理 Store 的引用和方法
 * - 方便在多个组件中复用
 */
export function usePlayer() {
  const playerStore = usePlayerStore();

  // 使用 storeToRefs 解构状态（保持响应性）
  // 注意：直接解构 playerStore 会失去响应性！
  const {
    playing,
    loading,
    currentTrack,
    errorMessage,
    currentTrackName,
    currentArtists,
  } = storeToRefs(playerStore);

  // 解构方法（不需要 storeToRefs）
  const { playTrack, pause, resume, togglePlay, stop } = playerStore;

  return {
    // State（响应式）
    playing,
    loading,
    currentTrack,
    errorMessage,
    currentTrackName,
    currentArtists,

    // Actions
    playTrack,
    pause,
    resume,
    togglePlay,
    stop,
  };
}
```

---

## Step 6: View 层（创建页面）

### Step 6.1: 创建主页面

**创建文件**：`src/views/Home.vue`

```vue
<template>
  <div class="home">
    <h1>🎵 YesPlayMusic Demo</h1>
    <p class="subtitle">Vue 3 + Pinia + TypeScript 播放器演示</p>

    <!-- 歌曲信息卡片 -->
    <div v-if="currentTrack" class="track-card">
      <img
        :src="currentTrack.album.picUrl + '?param=300y300'"
        alt="专辑封面"
        class="cover"
      />
      <div class="info">
        <h2>{{ currentTrack.name }}</h2>
        <p class="artists">{{ currentArtists }}</p>
        <p class="album">{{ currentTrack.album.name }}</p>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error">❌ {{ errorMessage }}</div>

    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="handlePlay" :disabled="loading" class="btn btn-primary">
        {{ buttonText }}
      </button>

      <button
        v-if="currentTrack"
        @click="togglePlay"
        :disabled="loading"
        class="btn btn-secondary"
      >
        {{ playing ? "⏸️ 暂停" : "▶️ 播放" }}
      </button>

      <button
        v-if="currentTrack"
        @click="stop"
        :disabled="loading"
        class="btn btn-secondary"
      >
        ⏹️ 停止
      </button>
    </div>

    <div class="tips">
      <p>📝 当前演示歌曲：周杰伦 - 晴天（ID: {{ DEMO_TRACK_ID }}）</p>
      <p>💡 点击"加载并播放"开始体验！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePlayer } from "@/composables/usePlayer";

// 演示用的歌曲 ID（周杰伦 - 晴天）
const DEMO_TRACK_ID = 186016;

// 使用 Composable
const {
  playing,
  loading,
  currentTrack,
  errorMessage,
  currentArtists,
  playTrack,
  togglePlay,
  stop,
} = usePlayer();

// 按钮文本
const buttonText = computed(() => {
  if (loading.value) return "⏳ 加载中...";
  if (currentTrack.value) return "🔄 重新加载";
  return "🎵 加载并播放";
});

// 处理播放按钮点击
function handlePlay() {
  playTrack(DEMO_TRACK_ID);
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

h1 {
  font-size: 36px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
}

/* 歌曲卡片 */
.track-card {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.track-card:hover {
  transform: translateY(-4px);
}

.cover {
  width: 160px;
  height: 160px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  object-fit: cover;
}

.info {
  flex: 1;
  text-align: left;
}

.info h2 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #333;
}

.artists {
  font-size: 18px;
  color: #667eea;
  margin-bottom: 8px;
  font-weight: 500;
}

.album {
  font-size: 14px;
  color: #999;
}

/* 加载中 */
.loading {
  margin: 30px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 12px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 错误提示 */
.error {
  padding: 16px 24px;
  background: #fff2f0;
  border: 2px solid #ffccc7;
  border-radius: 12px;
  color: #ff4d4f;
  margin: 20px 0;
  font-size: 16px;
}

/* 控制按钮 */
.controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 30px 0;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 32px;
  font-size: 18px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  min-width: 160px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
  box-shadow: none;
  border: none;
}

/* 提示信息 */
.tips {
  margin-top: 40px;
  padding: 20px;
  background: #f7f8fa;
  border-radius: 12px;
}

.tips p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 600px) {
  .track-card {
    flex-direction: column;
    text-align: center;
  }

  .info {
    text-align: center;
  }

  .controls {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
```

---

### Step 6.2: 修改 App.vue

**修改文件**：`src/App.vue`

```vue
<template>
  <div id="app">
    <Home />
  </div>
</template>

<script setup lang="ts">
import Home from "./views/Home.vue";
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, "Noto Sans", sans-serif;
  background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  padding: 20px;
}
</style>
```

---

## ✅ 完成！现在运行测试

### 1. 确认所有文件都已创建

```
src/
├── api/
│   ├── request.ts       ✅
│   └── track.ts         ✅
├── types/
│   └── track.ts         ✅
├── services/
│   └── AudioService.ts  ✅ 新增
├── stores/
│   ├── index.ts         ✅ 新增
│   └── player.ts        ✅ 新增
├── composables/
│   └── usePlayer.ts     ✅ 新增
├── views/
│   └── Home.vue         ✅ 新增
├── App.vue              ✅ 修改
└── main.ts              ✅ 修改
```

### 2. 运行项目

```bash
npm run dev
```

### 3. 测试功能

1. 打开 http://localhost:5173
2. 点击"加载并播放"按钮
3. 应该看到歌曲信息（晴天 - 周杰伦）
4. 音乐开始播放
5. 可以点击"暂停"/"播放"/"停止"按钮测试

### 4. 查看控制台输出

正常情况下应该看到：

```
🚀 App started with Pinia
📀 [PlayerStore] Fetching track: 186016
✅ [PlayerStore] Track info loaded: 晴天
✅ [PlayerStore] Play URL loaded: https://...
🎵 [AudioService] Playing: https://...
✅ [AudioService] Audio loaded successfully
🎉 [PlayerStore] Now playing: 晴天
```

---

## 🎯 数据流演示

完整的数据流：

```
用户点击按钮
    ↓
Home.vue 调用 handlePlay()
    ↓
usePlayer() 返回 playTrack 方法
    ↓
playerStore.playTrack(186016)
    ↓
getTrackDetail(186016) → 调用 API → 返回歌曲信息
    ↓
getTrackUrl(186016) → 调用 API → 返回播放 URL
    ↓
audioService.play(url) → Howler.js 播放
    ↓
Store 更新状态 (playing = true, currentTrack = {...})
    ↓
Home.vue 自动更新 UI（响应式）
```

---

## 🐛 常见问题

### Q1: 提示 "无法获取播放链接"

**原因**：可能需要 VIP 或歌曲下架  
**解决**：换一个歌曲 ID，比如 `347230` (说好不哭)

### Q2: 网络请求失败

**原因**：网易云 API 服务未启动  
**解决**：确保 `http://localhost:3000` 可以访问

### Q3: 音频加载失败

**原因**：CORS 问题或音频 URL 过期  
**解决**：检查 Vite 代理配置，确保 `/api` 正确转发

---

## 🎉 恭喜完成！

你现在已经完成了一个完整的 Vue 3 + Pinia + TypeScript 音乐播放器 Demo！

**学到的内容**：

- ✅ Service 层封装（AudioService）
- ✅ Pinia Store 状态管理
- ✅ Composable 设计模式
- ✅ Vue 3 Composition API
- ✅ 完整的数据流（View → Composable → Store → API）

**下一步可以做什么？**

1. 添加播放进度条
2. 实现播放列表
3. 添加歌词显示
4. 实现搜索功能
5. 添加更多控制按钮（上一首/下一首）

需要帮助的话随时告诉我！🚀

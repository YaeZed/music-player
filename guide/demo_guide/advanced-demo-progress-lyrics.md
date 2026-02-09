# 进阶 Demo：播放进度条 + 歌词显示

> **前置条件**：你已经完成了基础播放器 Demo  
> **新增功能**：播放进度条、歌词获取与同步显示

---

## 📋 功能预览

完成后你将拥有：

- ✅ 实时播放进度条（可拖动跳转）
- ✅ 歌词获取与解析
- ✅ 歌词滚动与高亮显示
- ✅ 时间格式化显示

---

## Step 1: 扩展类型定义

### Step 1.1: 添加歌词类型

**修改文件**：`src/types/track.ts`

在文件末尾添加：

```typescript
/**
 * 歌词行
 */
export interface LyricLine {
  time: number; // 时间（秒）
  text: string; // 歌词文本
}

/**
 * 歌词数据
 */
export interface Lyric {
  lines: LyricLine[];
}

/**
 * 歌词 API 响应
 */
export interface LyricResponse {
  code: number;
  lrc?: {
    lyric: string; // LRC 格式歌词
  };
  tlyric?: {
    lyric: string; // 翻译歌词
  };
}
```

---

## Step 2: 扩展 API 层

### Step 2.1: 添加歌词 API

**修改文件**：`src/api/track.ts`

在文件末尾添加：

```typescript
import type { LyricResponse } from "@/types/track";

/**
 * 获取歌词
 * @param id - 歌曲 ID
 */
export async function getTrackLyric(id: number): Promise<string> {
  const res = await request.get<LyricResponse>("/lyric", {
    params: { id },
  });

  if (!res.lrc || !res.lrc.lyric) {
    throw new Error("歌词不存在");
  }

  return res.lrc.lyric;
}
```

---

## Step 3: 创建工具函数

### Step 3.1: 创建时间格式化工具

**创建文件**：`src/utils/format.ts`

```typescript
/**
 * 格式化秒数为 mm:ss 格式
 * @param seconds - 秒数
 * @returns 格式化的时间字符串
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 格式化毫秒为 mm:ss 格式
 * @param ms - 毫秒数
 */
export function formatDuration(ms: number): string {
  return formatTime(ms / 1000);
}
```

**测试**：

```typescript
import { formatTime, formatDuration } from "@/utils/format";

console.log(formatTime(125)); // "02:05"
console.log(formatDuration(125000)); // "02:05"
```

---

### Step 3.2: 创建歌词解析工具

**创建文件**：`src/utils/lyric.ts`

```typescript
import type { Lyric, LyricLine } from "@/types/track";

/**
 * 解析 LRC 格式歌词
 *
 * LRC 格式示例：
 * [00:12.00]歌词第一行
 * [00:17.20]歌词第二行
 *
 * @param lrcString - LRC 格式字符串
 * @returns 解析后的歌词对象
 */
export function parseLyric(lrcString: string): Lyric {
  const lines: LyricLine[] = [];

  // 按行分割
  const lrcLines = lrcString.split("\n");

  // 时间标签正则：[mm:ss.xx]
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lrcLines) {
    // 提取所有时间标签
    const times: number[] = [];
    let match;

    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3].padEnd(3, "0"));

      // 转换为总秒数
      const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
      times.push(totalSeconds);
    }

    // 提取歌词文本（去除时间标签）
    const text = line.replace(/\[.*?\]/g, "").trim();

    // 如果有文本，为每个时间标签创建一行歌词
    if (text && times.length > 0) {
      for (const time of times) {
        lines.push({ time, text });
      }
    }
  }

  // 按时间排序
  lines.sort((a, b) => a.time - b.time);

  return { lines };
}

/**
 * 获取当前应该显示的歌词索引
 * 使用二分查找优化性能 O(log n)
 *
 * @param lines - 歌词行数组
 * @param currentTime - 当前播放时间（秒）
 * @returns 当前歌词的索引
 */
export function getCurrentLyricIndex(
  lines: LyricLine[],
  currentTime: number,
): number {
  if (lines.length === 0) return -1;

  // 二分查找
  let left = 0;
  let right = lines.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (lines[mid].time <= currentTime) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}
```

**测试**：

```typescript
import { parseLyric, getCurrentLyricIndex } from "@/utils/lyric";

const lrcString = `[00:12.00]第一行
[00:17.20]第二行
[00:21.10]第三行`;

const lyric = parseLyric(lrcString);
console.log(lyric.lines);
// [
//   { time: 12, text: '第一行' },
//   { time: 17.2, text: '第二行' },
//   { time: 21.1, text: '第三行' }
// ]

const index = getCurrentLyricIndex(lyric.lines, 18);
console.log(index); // 1 (第二行）
```

---

## Step 4: 扩展 AudioService

### Step 4.1: 添加进度监听

**修改文件**：`src/services/AudioService.ts`

在 `AudioService` 类中添加以下方法：

```typescript
export class AudioService {
  private howler: Howl | null = null;
  private currentUrl: string = "";
  private progressTimer: number | null = null; // 👈 新增：进度定时器

  // ... 之前的代码 ...

  /**
   * 开始监听播放进度
   * @param callback - 进度回调函数（每秒调用一次）
   */
  startProgressTracking(
    callback: (currentTime: number, duration: number) => void,
  ): void {
    this.stopProgressTracking();

    this.progressTimer = window.setInterval(() => {
      if (this.howler && this.howler.playing()) {
        const currentTime = this.getCurrentTime();
        const duration = this.getDuration();
        callback(currentTime, duration);
      }
    }, 1000); // 每秒更新一次
  }

  /**
   * 停止监听播放进度
   */
  stopProgressTracking(): void {
    if (this.progressTimer !== null) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  /**
   * 获取音频总时长（秒）
   */
  getDuration(): number {
    return this.howler?.duration() ?? 0;
  }

  /**
   * 修改 unload 方法，确保清理定时器
   */
  unload(): void {
    this.stopProgressTracking(); // 👈 新增：清理定时器

    if (this.howler) {
      this.howler.unload();
      this.howler = null;
      this.currentUrl = "";
      console.log("🗑️ [AudioService] Audio unloaded");
    }
  }
}
```

---

## Step 5: 创建歌词 Composable

### Step 5.1: 创建 useLyrics

**创建文件**：`src/composables/useLyrics.ts`

```typescript
import { ref, computed, watch } from "vue";
import { getTrackLyric } from "@/api/track";
import { parseLyric, getCurrentLyricIndex } from "@/utils/lyric";
import type { Lyric, LyricLine } from "@/types/track";

/**
 * 歌词 Composable
 *
 * 职责：
 * - 获取和解析歌词
 * - 根据当前播放时间计算应显示的歌词
 */
export function useLyrics() {
  // State
  const lyric = ref<Lyric | null>(null);
  const loading = ref(false);
  const error = ref("");

  // Getters
  const lines = computed<LyricLine[]>(() => lyric.value?.lines ?? []);

  const hasLyric = computed(() => lines.value.length > 0);

  /**
   * 获取指定时间的歌词索引
   */
  const getLyricIndex = (currentTime: number): number => {
    return getCurrentLyricIndex(lines.value, currentTime);
  };

  /**
   * 获取指定时间的歌词文本
   */
  const getCurrentLyric = (currentTime: number): string => {
    const index = getLyricIndex(currentTime);
    if (index >= 0 && index < lines.value.length) {
      return lines.value[index].text;
    }
    return "";
  };

  // Actions
  /**
   * 加载歌词
   */
  async function loadLyric(trackId: number) {
    try {
      loading.value = true;
      error.value = "";

      console.log("📝 [useLyrics] Loading lyric for track:", trackId);

      const lrcString = await getTrackLyric(trackId);
      lyric.value = parseLyric(lrcString);

      console.log(
        "✅ [useLyrics] Lyric loaded, lines:",
        lyric.value.lines.length,
      );
    } catch (err: any) {
      error.value = err.message || "歌词加载失败";
      console.error("❌ [useLyrics] Failed to load lyric:", err);
      lyric.value = null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 清空歌词
   */
  function clearLyric() {
    lyric.value = null;
    error.value = "";
  }

  return {
    // State
    lyric,
    loading,
    error,

    // Getters
    lines,
    hasLyric,

    // Methods
    getLyricIndex,
    getCurrentLyric,
    loadLyric,
    clearLyric,
  };
}
```

---

## Step 6: 扩展 PlayerStore

### Step 6.1: 添加进度状态

**修改文件**：`src/stores/player.ts`

添加进度相关的状态和方法：

```typescript
import { audioService } from "@/services/AudioService";

export const usePlayerStore = defineStore("player", () => {
  // ============ State ============
  const playing = ref(false);
  const loading = ref(false);
  const currentTrack = ref<Track | null>(null);
  const errorMessage = ref("");

  // 👇 新增：进度相关状态
  const currentTime = ref(0); // 当前播放时间（秒）
  const duration = ref(0); // 总时长（秒）

  // ============ Getters ============
  // ... 之前的 getters ...

  // 👇 新增：进度百分比
  const progress = computed(() => {
    if (duration.value === 0) return 0;
    return (currentTime.value / duration.value) * 100;
  });

  // ============ Actions ============

  /**
   * 播放指定歌曲（修改）
   */
  async function playTrack(trackId: number) {
    try {
      loading.value = true;
      errorMessage.value = "";

      console.log("📀 [PlayerStore] Fetching track:", trackId);

      const track = await getTrackDetail(trackId);
      currentTrack.value = track;

      // 👇 新增：设置总时长
      duration.value = track.duration / 1000;

      console.log("✅ [PlayerStore] Track info loaded:", track.name);

      const url = await getTrackUrl(trackId);
      console.log("✅ [PlayerStore] Play URL loaded:", url);

      await audioService.play(url);
      playing.value = true;

      // 👇 新增：开始监听进度
      audioService.startProgressTracking((current, dur) => {
        currentTime.value = current;
        duration.value = dur;
      });

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
   * 暂停播放（修改）
   */
  function pause() {
    audioService.pause();
    audioService.stopProgressTracking(); // 👈 新增
    playing.value = false;
  }

  /**
   * 恢复播放（修改）
   */
  function resume() {
    audioService.resume();
    // 👇 新增：重新开始监听进度
    audioService.startProgressTracking((current, dur) => {
      currentTime.value = current;
      duration.value = dur;
    });
    playing.value = true;
  }

  /**
   * 停止播放（修改）
   */
  function stop() {
    audioService.stop();
    audioService.stopProgressTracking(); // 👈 新增
    playing.value = false;
    currentTime.value = 0; // 👈 新增
  }

  /**
   * 跳转到指定时间
   * @param time - 时间（秒）
   */
  function seekTo(time: number) {
    audioService.seek(time);
    currentTime.value = time;
    console.log("⏩ [PlayerStore] Seeked to:", time);
  }

  // ============ 返回 ============
  return {
    // State
    playing,
    loading,
    currentTrack,
    errorMessage,
    currentTime, // 👈 新增
    duration, // 👈 新增

    // Getters
    currentTrackId,
    currentTrackName,
    currentArtists,
    progress, // 👈 新增

    // Actions
    playTrack,
    pause,
    resume,
    togglePlay,
    stop,
    seekTo, // 👈 新增
  };
});
```

---

## Step 7: 扩展 usePlayer Composable

**修改文件**：`src/composables/usePlayer.ts`

```typescript
import { storeToRefs } from "pinia";
import { usePlayerStore } from "@/stores/player";

export function usePlayer() {
  const playerStore = usePlayerStore();

  const {
    playing,
    loading,
    currentTrack,
    errorMessage,
    currentTrackName,
    currentArtists,
    currentTime, // 👈 新增
    duration, // 👈 新增
    progress, // 👈 新增
  } = storeToRefs(playerStore);

  const {
    playTrack,
    pause,
    resume,
    togglePlay,
    stop,
    seekTo, // 👈 新增
  } = playerStore;

  return {
    // State
    playing,
    loading,
    currentTrack,
    errorMessage,
    currentTrackName,
    currentArtists,
    currentTime, // 👈 新增
    duration, // 👈 新增
    progress, // 👈 新增

    // Actions
    playTrack,
    pause,
    resume,
    togglePlay,
    stop,
    seekTo, // 👈 新增
  };
}
```

---

## Step 8: 重构 Home.vue（完整版）

**修改文件**：`src/views/Home.vue`

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

    <!-- 👇 新增：播放进度条 -->
    <div v-if="currentTrack" class="progress-section">
      <span class="time">{{ formatTime(currentTime) }}</span>

      <div class="progress-bar-container">
        <input
          type="range"
          class="progress-bar"
          :value="currentTime"
          :max="duration"
          :step="0.1"
          @input="handleSeek"
          @mousedown="isSeeking = true"
          @mouseup="isSeeking = false"
        />
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <span class="time">{{ formatTime(duration) }}</span>
    </div>

    <!-- 👇 新增：歌词显示 -->
    <div v-if="currentTrack" class="lyrics-section">
      <div v-if="lyricLoading" class="lyrics-loading">加载歌词中...</div>

      <div v-else-if="lyricError" class="lyrics-error">
        {{ lyricError }}
      </div>

      <div v-else-if="hasLyric" class="lyrics-container" ref="lyricsRef">
        <div
          v-for="(line, index) in lines"
          :key="index"
          class="lyric-line"
          :class="{ active: index === currentLyricIndex }"
        >
          {{ line.text }}
        </div>
      </div>

      <div v-else class="lyrics-empty">暂无歌词</div>
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
import { ref, computed, watch, nextTick } from "vue";
import { usePlayer } from "@/composables/usePlayer";
import { useLyrics } from "@/composables/useLyrics";
import { formatTime } from "@/utils/format";

const DEMO_TRACK_ID = 186016;

// 播放器逻辑
const {
  playing,
  loading,
  currentTrack,
  errorMessage,
  currentArtists,
  currentTime,
  duration,
  progress,
  playTrack,
  togglePlay,
  stop,
  seekTo,
} = usePlayer();

// 歌词逻辑
const {
  lines,
  hasLyric,
  loading: lyricLoading,
  error: lyricError,
  getLyricIndex,
  loadLyric,
  clearLyric,
} = useLyrics();

// 进度条拖动状态
const isSeeking = ref(false);

// 当前歌词索引
const currentLyricIndex = computed(() => {
  if (!hasLyric.value || isSeeking.value) return -1;
  return getLyricIndex(currentTime.value);
});

// 歌词容器引用
const lyricsRef = ref<HTMLElement | null>(null);

// 按钮文本
const buttonText = computed(() => {
  if (loading.value) return "⏳ 加载中...";
  if (currentTrack.value) return "🔄 重新加载";
  return "🎵 加载并播放";
});

// 处理播放
async function handlePlay() {
  try {
    await playTrack(DEMO_TRACK_ID);
    // 播放成功后加载歌词
    loadLyric(DEMO_TRACK_ID);
  } catch (error) {
    console.error("播放失败:", error);
  }
}

// 处理进度条拖动
function handleSeek(e: Event) {
  const value = parseFloat((e.target as HTMLInputElement).value);
  seekTo(value);
}

// 监听当前歌词索引，自动滚动
watch(currentLyricIndex, async (newIndex) => {
  if (newIndex < 0 || !lyricsRef.value) return;

  await nextTick();

  const activeLine = lyricsRef.value.querySelector(".lyric-line.active");
  if (activeLine) {
    activeLine.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
});

// 清理：切换歌曲时清空歌词
watch(currentTrack, (newTrack, oldTrack) => {
  if (oldTrack && newTrack?.id !== oldTrack.id) {
    clearLyric();
  }
});
</script>

<style scoped>
.home {
  max-width: 900px;
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
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.cover {
  width: 160px;
  height: 160px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.info {
  flex: 1;
  text-align: left;
}

.info h2 {
  font-size: 28px;
  margin-bottom: 12px;
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

/* 👇 新增：进度条样式 */
.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.time {
  font-size: 14px;
  color: #666;
  min-width: 45px;
  font-variant-numeric: tabular-nums;
}

.progress-bar-container {
  flex: 1;
  position: relative;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  pointer-events: none;
  transition: width 0.3s;
}

.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.progress-bar::-webkit-slider-thumb {
  opacity: 1;
  width: 16px;
  height: 16px;
  background: #667eea;
  border-radius: 50%;
  cursor: pointer;
}

/* 👇 新增：歌词样式 */
.lyrics-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.lyrics-loading,
.lyrics-error,
.lyrics-empty {
  padding: 40px;
  color: #999;
  font-size: 16px;
}

.lyrics-error {
  color: #ff4d4f;
}

.lyrics-container {
  padding: 20px 0;
}

.lyric-line {
  padding: 12px 0;
  color: #999;
  font-size: 16px;
  line-height: 1.8;
  transition: all 0.3s;
}

.lyric-line.active {
  color: #667eea;
  font-size: 20px;
  font-weight: 600;
  transform: scale(1.05);
}

/* 滚动条样式 */
.lyrics-section::-webkit-scrollbar {
  width: 6px;
}

.lyrics-section::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.lyrics-section::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.lyrics-section::-webkit-scrollbar-thumb:hover {
  background: #999;
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
  }

  .info {
    text-align: center;
  }
}
</style>
```

---

## ✅ 完整文件清单

确保你有这些文件：

```
src/
├── api/
│   ├── request.ts       ✅
│   └── track.ts         ✅ (修改：添加 getTrackLyric)
├── types/
│   └── track.ts         ✅ (修改：添加歌词类型)
├── utils/               ✅ 新增文件夹
│   ├── format.ts        ✅ 新增
│   └── lyric.ts         ✅ 新增
├── services/
│   └── AudioService.ts  ✅ (修改：添加进度监听)
├── stores/
│   ├── index.ts         ✅
│   └── player.ts        ✅ (修改：添加进度和跳转)
├── composables/
│   ├── usePlayer.ts     ✅ (修改：导出新状态)
│   └── useLyrics.ts     ✅ 新增
├── views/
│   └── Home.vue         ✅ (修改：添加进度条和歌词)
├── App.vue              ✅
└── main.ts              ✅
```

---

## 🚀 运行测试

```bash
npm run dev
```

### 测试功能

1. **播放进度条**：
   - 点击播放后，进度条自动更新
   - 拖动进度条可以跳转播放位置
   - 显示当前时间和总时长

2. **歌词显示**：
   - 播放后自动加载歌词
   - 歌词随播放进度高亮
   - 当前歌词自动滚动到中心

---

## 🎯 数据流说明

### 进度更新流程

```
AudioService (每秒触发回调)
    ↓
playerStore.currentTime 更新
    ↓
Home.vue 响应式更新进度条
```

### 歌词显示流程

```
用户播放歌曲
    ↓
Home.vue 调用 loadLyric(trackId)
    ↓
useLyrics 调用 getTrackLyric API
    ↓
parseLyric 解析 LRC 格式
    ↓
Home.vue 监听 currentTime
    ↓
计算 currentLyricIndex
    ↓
高亮当前歌词并滚动
```

---

## 🐛 常见问题

### Q1: 歌词不显示

**原因**：歌曲可能没有歌词  
**解决**：检查控制台是否有"歌词不存在"错误

### Q2: 进度条不更新

**原因**：定时器未启动  
**解决**：检查 `startProgressTracking` 是否被调用

### Q3: 歌词不滚动

**原因**：`lyricsRef` 未正确绑定  
**解决**：确保 `ref="lyricsRef"` 在歌词容器上

---

## 🎉 恭喜完成进阶 Demo！

你现在拥有一个功能完整的音乐播放器：

- ✅ 歌曲播放/暂停/停止
- ✅ 实时进度显示和拖动跳转
- ✅ 歌词加载与同步显示
- ✅ 优雅的 UI 和动画

**学到的新知识**：

- 定时器管理
- LRC 歌词解析
- 二分查找算法
- 滚动到视图
- 响应式数据绑定

需要继续添加功能（如播放列表、音量控制）随时告诉我！🚀

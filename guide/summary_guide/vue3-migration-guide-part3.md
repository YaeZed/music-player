# YesPlayMusic Vue 3 重构学习手册 - 第三部分

## 第六章：性能优化与进阶技巧

### 6.1 虚拟列表（Virtual List）优化

#### **6.1.1 为什么需要虚拟列表？**

**问题场景**：

- 用户的歌单包含 1000+ 首歌曲
- 每首歌曲渲染一个 DOM 节点（包含图片、文字、按钮等）
- 浏览器需要渲染 1000+ 个 DOM 节点 → **性能灾难**

**传统渲染 vs 虚拟列表**：

```
传统渲染（渲染所有 1000 首歌曲）：
- DOM 节点数：~5000+（每首歌曲约 5 个节点）
- 内存占用：~50MB
- 首次渲染时间：~2000ms
- 滚动卡顿

虚拟列表（仅渲染可见区域的约 20 首歌曲）：
- DOM 节点数：~100
- 内存占用：~5MB
- 首次渲染时间：~200ms
- 滚动流畅（60fps）
```

---

#### **6.1.2 实现原理**

```
┌─────────────────────────────┐
│   可见区域（Viewport）       │ ← 仅渲染这部分
│   ┌─────────────────────┐   │
│   │ Item 10             │   │
│   │ Item 11             │   │
│   │ Item 12   (实际DOM) │   │
│   │ Item 13             │   │
│   └─────────────────────┘   │
│                             │
│   上方占位（空白 div）       │ ← 撑开高度，模拟滚动
│   下方占位（空白 div）       │
└─────────────────────────────┘
```

**核心思路**：

1. 计算可见区域能容纳多少个列表项
2. 仅渲染可见区域 + 上下缓冲区的列表项
3. 通过占位元素撑开总高度，模拟完整列表
4. 监听滚动事件，动态更新渲染的列表项

---

#### **6.1.3 使用第三方库：vue-virtual-scroller**

```bash
npm install vue-virtual-scroller
```

**基础使用**：

```vue
<!-- components/TrackList.vue -->
<template>
  <RecycleScroller
    :items="tracks"
    :item-size="64"
    key-field="id"
    class="track-list"
  >
    <template #default="{ item }">
      <TrackListItem :track="item" />
    </template>
  </RecycleScroller>
</template>

<script setup lang="ts">
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import TrackListItem from "./TrackListItem.vue";
import type { Track } from "@/types/entities/track";

defineProps<{
  tracks: Track[];
}>();
</script>

<style scoped>
.track-list {
  height: 100vh; /* 必须设置固定高度 */
}
</style>
```

---

#### **6.1.4 自定义虚拟列表实现**

**适用场景**：

- 需要高度定制化（如不同高度的列表项）
- 需要完全控制渲染逻辑
- 学习虚拟列表原理

```vue
<!-- composables/useVirtualList.ts -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface UseVirtualListOptions {
  itemHeight: number; // 单个列表项高度
  bufferSize?: number; // 缓冲区大小（上下各渲染多少额外项）
  containerHeight?: number; // 容器高度（默认为窗口高度）
}

/**
 * 虚拟列表 Composable
 *
 * @param items - 列表数据
 * @param options - 配置项
 * @returns 虚拟列表所需的响应式数据和方法
 */
export function useVirtualList<T>(
  items: Ref<T[]>,
  options: UseVirtualListOptions,
) {
  const {
    itemHeight,
    bufferSize = 5,
    containerHeight = window.innerHeight,
  } = options;

  // 滚动容器的引用
  const containerRef = ref<HTMLElement | null>(null);

  // 当前滚动位置
  const scrollTop = ref(0);

  /**
   * 计算可见区域能容纳多少个列表项
   */
  const visibleCount = computed(() => {
    return Math.ceil(containerHeight / itemHeight);
  });

  /**
   * 计算当前应该渲染的起始索引
   *
   * 为什么要减去 bufferSize？
   * - 在用户向下滚动时，预渲染上方的几个项
   * - 避免快速滚动时出现白屏
   */
  const startIndex = computed(() => {
    const index = Math.floor(scrollTop.value / itemHeight) - bufferSize;
    return Math.max(0, index);
  });

  /**
   * 计算当前应该渲染的结束索引
   */
  const endIndex = computed(() => {
    const index = startIndex.value + visibleCount.value + bufferSize * 2;
    return Math.min(items.value.length, index);
  });

  /**
   * 当前应该渲染的列表项
   */
  const visibleItems = computed(() => {
    return items.value
      .slice(startIndex.value, endIndex.value)
      .map((item, index) => ({
        data: item,
        index: startIndex.value + index, // 原始索引
      }));
  });

  /**
   * 上方占位元素的高度
   *
   * 作用：撑开滚动条，模拟上方被隐藏的列表项
   */
  const offsetTop = computed(() => {
    return startIndex.value * itemHeight;
  });

  /**
   * 下方占位元素的高度
   */
  const offsetBottom = computed(() => {
    return (items.value.length - endIndex.value) * itemHeight;
  });

  /**
   * 容器总高度
   */
  const totalHeight = computed(() => {
    return items.value.length * itemHeight;
  });

  /**
   * 处理滚动事件
   *
   * 性能优化：使用 requestAnimationFrame 节流
   */
  let rafId: number | null = null;
  function handleScroll(e: Event) {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      const target = e.target as HTMLElement;
      scrollTop.value = target.scrollTop;
      rafId = null;
    });
  }

  /**
   * 滚动到指定索引
   * @param index - 目标索引
   */
  function scrollToIndex(index: number) {
    if (!containerRef.value) return;
    containerRef.value.scrollTop = index * itemHeight;
  }

  // 挂载时绑定滚动事件
  onMounted(() => {
    containerRef.value?.addEventListener("scroll", handleScroll, {
      passive: true,
    });
  });

  // 卸载时清理
  onUnmounted(() => {
    containerRef.value?.removeEventListener("scroll", handleScroll);
    if (rafId) cancelAnimationFrame(rafId);
  });

  return {
    containerRef,
    visibleItems,
    offsetTop,
    offsetBottom,
    totalHeight,
    scrollToIndex,
  };
}
</script>
```

**使用示例**：

```vue
<!-- components/VirtualTrackList.vue -->
<template>
  <div ref="containerRef" class="virtual-list">
    <!-- 上方占位 -->
    <div :style="{ height: offsetTop + 'px' }"></div>

    <!-- 可见区域 -->
    <div
      v-for="{ data, index } in visibleItems"
      :key="data.id"
      class="track-item"
      :style="{ height: '64px' }"
    >
      <TrackListItem :track="data" :index="index" />
    </div>

    <!-- 下方占位 -->
    <div :style="{ height: offsetBottom + 'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useVirtualList } from "@/composables/useVirtualList";
import TrackListItem from "./TrackListItem.vue";
import type { Track } from "@/types/entities/track";

const props = defineProps<{
  tracks: Track[];
}>();

const tracksRef = ref(props.tracks);

const { containerRef, visibleItems, offsetTop, offsetBottom } = useVirtualList(
  tracksRef,
  {
    itemHeight: 64, // 每个列表项高度 64px
    bufferSize: 5, // 上下各缓冲 5 个项
  },
);
</script>

<style scoped>
.virtual-list {
  height: 100vh;
  overflow-y: auto;
}
</style>
```

---

### 6.2 图片懒加载

#### **6.2.1 使用 IntersectionObserver API**

**原理**：

- 监听图片元素是否进入视口
- 进入视口时才加载真实图片
- 未进入视口时显示占位图或模糊缩略图

```typescript
// composables/useLazyLoad.ts
import { ref, onMounted, onUnmounted } from "vue";

/**
 * 图片懒加载 Composable
 *
 * 使用示例：
 * const { imageRef, isLoaded } = useLazyLoad(imageUrl)
 * <img ref="imageRef" :src="isLoaded ? imageUrl : placeholderUrl" />
 */
export function useLazyLoad(imageUrl: string) {
  const imageRef = ref<HTMLImageElement | null>(null);
  const isLoaded = ref(false);

  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!imageRef.value) return;

    /**
     * IntersectionObserver 配置
     *
     * rootMargin: 提前 100px 开始加载（用户还没滚动到时就预加载）
     * threshold: 元素至少 10% 可见时触发
     */
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded.value) {
            // 元素进入视口，开始加载图片
            loadImage();
          }
        });
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    observer.observe(imageRef.value);
  });

  onUnmounted(() => {
    if (observer && imageRef.value) {
      observer.unobserve(imageRef.value);
      observer.disconnect();
    }
  });

  /**
   * 加载图片
   *
   * 为什么要创建新的 Image 对象？
   * - 预加载图片，等图片完全下载后再显示
   * - 避免显示加载中的部分图片（渐进式显示）
   */
  function loadImage() {
    const img = new Image();
    img.onload = () => {
      isLoaded.value = true;
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${imageUrl}`);
      isLoaded.value = false;
    };
    img.src = imageUrl;
  }

  return {
    imageRef,
    isLoaded,
  };
}
```

**组件使用**：

```vue
<!-- components/LazyImage.vue -->
<template>
  <div class="lazy-image">
    <img
      ref="imageRef"
      :src="isLoaded ? src : placeholder"
      :alt="alt"
      :class="{ loaded: isLoaded }"
    />
    <div v-if="!isLoaded" class="skeleton"></div>
  </div>
</template>

<script setup lang="ts">
import { useLazyLoad } from "@/composables/useLazyLoad";

const props = defineProps<{
  src: string;
  alt?: string;
  placeholder?: string;
}>();

const { imageRef, isLoaded } = useLazyLoad(props.src);
</script>

<style scoped>
.lazy-image {
  position: relative;
  overflow: hidden;
}

.lazy-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s;
}

.lazy-image img.loaded {
  opacity: 1;
}

/* 骨架屏占位 */
.skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
```

---

#### **6.2.2 渐进式图片加载（Progressive JPEG）**

**策略**：

1. 先加载低质量缩略图（?param=100y100）
2. 等高质量图片下载完成后替换
3. 使用 CSS 模糊效果平滑过渡

```vue
<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  src: string; // 原图 URL
}>();

// 网易云图片质量参数
const lowQualitySrc = ref(props.src + "?param=100y100"); // 低质量
const highQualitySrc = ref(props.src + "?param=500y500"); // 高质量

const currentSrc = ref(lowQualitySrc.value);
const isHighQualityLoaded = ref(false);

// 预加载高质量图片
watch(
  () => props.src,
  (newSrc) => {
    const img = new Image();
    img.onload = () => {
      currentSrc.value = highQualitySrc.value;
      isHighQualityLoaded.value = true;
    };
    img.src = highQualitySrc.value;
  },
  { immediate: true },
);
</script>

<template>
  <img :src="currentSrc" :class="{ blur: !isHighQualityLoaded }" alt="" />
</template>

<style scoped>
img.blur {
  filter: blur(10px);
  transition: filter 0.3s;
}
</style>
```

---

### 6.3 音频播放性能优化

#### **6.3.1 音频预加载策略**

```typescript
// services/AudioCacheService.ts

/**
 * 音频缓存服务
 *
 * 优化策略：
 * 1. 预加载下一首歌曲（用户点击"下一首"时秒开）
 * 2. 缓存最近播放的 5 首歌曲（前进后退秒开）
 * 3. 使用 IndexedDB 持久化缓存（刷新页面后仍可用）
 */
export class AudioCacheService {
  private cache = new Map<number, ArrayBuffer>(); // 内存缓存
  private maxCacheSize = 5; // 最多缓存 5 首歌曲
  private preloadQueue: number[] = []; // 预加载队列

  /**
   * 预加载下一首歌曲
   * @param trackId - 歌曲 ID
   */
  async preloadNext(trackId: number) {
    if (this.cache.has(trackId)) return; // 已缓存

    if (!this.preloadQueue.includes(trackId)) {
      this.preloadQueue.push(trackId);
    }

    // 后台静默加载
    this.processPreloadQueue();
  }

  /**
   * 处理预加载队列
   *
   * 为什么要队列？
   * - 防止同时下载多首歌曲占用带宽
   * - 优先加载最近添加的歌曲
   */
  private async processPreloadQueue() {
    if (this.preloadQueue.length === 0) return;

    const trackId = this.preloadQueue.shift()!;

    try {
      const url = await this.getAudioUrl(trackId);
      const arrayBuffer = await this.downloadAudio(url);

      this.addToCache(trackId, arrayBuffer);

      // 继续处理下一个
      if (this.preloadQueue.length > 0) {
        this.processPreloadQueue();
      }
    } catch (error) {
      console.error(`Failed to preload track ${trackId}:`, error);
    }
  }

  /**
   * 下载音频文件
   * @param url - 音频 URL
   * @returns ArrayBuffer
   */
  private async downloadAudio(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return response.arrayBuffer();
  }

  /**
   * 添加到缓存
   *
   * LRU 策略：最近最少使用的缓存被移除
   */
  private addToCache(trackId: number, data: ArrayBuffer) {
    // 如果缓存已满，移除最早的
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(trackId, data);

    // 同时保存到 IndexedDB（持久化）
    this.saveToIndexedDB(trackId, data);
  }

  /**
   * 获取缓存的音频数据
   * @param trackId - 歌曲 ID
   * @returns Blob URL 或 null
   */
  async getCachedAudio(trackId: number): Promise<string | null> {
    // 1. 先从内存缓存读取
    let arrayBuffer = this.cache.get(trackId);

    // 2. 内存中没有，从 IndexedDB 读取
    if (!arrayBuffer) {
      arrayBuffer = await this.loadFromIndexedDB(trackId);
      if (arrayBuffer) {
        this.cache.set(trackId, arrayBuffer); // 放入内存缓存
      }
    }

    if (!arrayBuffer) return null;

    // 3. 转换为 Blob URL
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }

  /**
   * 保存到 IndexedDB
   */
  private async saveToIndexedDB(trackId: number, data: ArrayBuffer) {
    // 实现略（参考原项目的 db.js）
  }

  /**
   * 从 IndexedDB 加载
   */
  private async loadFromIndexedDB(
    trackId: number,
  ): Promise<ArrayBuffer | null> {
    // 实现略
    return null;
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.cache.clear();
    this.preloadQueue = [];
  }
}
```

---

#### **6.3.2 音频格式选择策略**

```typescript
/**
 * 根据网络状况和设备性能选择合适的音频格式
 */
export class AudioQualitySelector {
  /**
   * 获取推荐的音频质量
   *
   * 决策因素：
   * 1. 用户设置（优先级最高）
   * 2. 网络速度
   * 3. 是否为移动设备（流量考虑）
   * 4. VIP 状态（无损音质需要 VIP）
   */
  async getRecommendedQuality(): Promise<AudioQuality> {
    const settings = useSettingsStore();
    const user = useUserStore();

    // 1. 用户手动设置，直接返回
    if (settings.audioQuality !== "auto") {
      return this.validateQuality(settings.audioQuality, user.isVip);
    }

    // 2. 自动选择
    const networkSpeed = await this.detectNetworkSpeed();
    const isMobile = this.isMobileDevice();

    if (isMobile && !this.isWiFi()) {
      // 移动网络：节省流量，选择标准音质
      return AudioQuality.STANDARD; // 128kbps
    }

    if (networkSpeed > 5) {
      // 网速快：选择高音质或无损
      return user.isVip ? AudioQuality.LOSSLESS : AudioQuality.HIGH;
    } else if (networkSpeed > 2) {
      return AudioQuality.HIGH; // 320kbps
    } else {
      return AudioQuality.STANDARD;
    }
  }

  /**
   * 检测网络速度（Mbps）
   *
   * 使用 Network Information API
   */
  private async detectNetworkSpeed(): Promise<number> {
    // @ts-ignore
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection && connection.downlink) {
      // downlink 单位为 Mbps
      return connection.downlink;
    }

    // 降级方案：下载小文件测速
    return this.measureSpeedByDownload();
  }

  private async measureSpeedByDownload(): Promise<number> {
    const testFileUrl = "https://music.163.com/style/web2/img/logo.png";
    const startTime = Date.now();

    try {
      const response = await fetch(testFileUrl);
      const blob = await response.blob();
      const duration = (Date.now() - startTime) / 1000; // 秒
      const sizeInMb = blob.size / 1024 / 1024;

      return sizeInMb / duration; // Mbps
    } catch {
      return 1; // 默认低速
    }
  }

  private isMobileDevice(): boolean {
    return /Mobile|Android|iPhone/i.test(navigator.userAgent);
  }

  private isWiFi(): boolean {
    // @ts-ignore
    const connection = navigator.connection;
    return connection?.type === "wifi";
  }

  private validateQuality(quality: AudioQuality, isVip: boolean): AudioQuality {
    // 非 VIP 用户无法使用无损音质
    if (quality === AudioQuality.LOSSLESS && !isVip) {
      return AudioQuality.HIGH;
    }
    return quality;
  }
}

export enum AudioQuality {
  STANDARD = 128000, // 标准 128kbps
  HIGH = 320000, // 高品质 320kbps
  LOSSLESS = 999000, // 无损 FLAC
}
```

---

### 6.4 歌词同步与滚动优化

#### **6.4.1 歌词解析**

```typescript
// services/LyricService.ts

/**
 * 歌词服务
 */
export class LyricService {
  /**
   * 解析 LRC 格式歌词
   *
   * LRC 格式示例：
   * [00:12.00]第一句歌词
   * [00:17.20]第二句歌词
   */
  parseLyric(rawLyric: string): LyricLine[] {
    const lines: LyricLine[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

    rawLyric.split("\n").forEach((line) => {
      const matches = Array.from(line.matchAll(timeRegex));

      if (matches.length === 0) return; // 跳过非歌词行（如标题、作者）

      // 提取歌词文本（去除时间标签）
      const text = line.replace(timeRegex, "").trim();

      matches.forEach((match) => {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3].padEnd(3, "0")); // 兼容 [00:12.0] 和 [00:12.000]

        const time = minutes * 60 + seconds + milliseconds / 1000;

        lines.push({ time, text });
      });
    });

    // 按时间排序
    return lines.sort((a, b) => a.time - b.time);
  }

  /**
   * 获取当前应该显示的歌词行索引
   * @param currentTime - 当前播放时间（秒）
   * @param lines - 歌词行数组
   * @returns 当前行索引
   *
   * 优化：使用二分查找（O(log n)）而不是线性查找（O(n)）
   */
  getCurrentLineIndex(currentTime: number, lines: LyricLine[]): number {
    if (lines.length === 0) return -1;

    let left = 0;
    let right = lines.length - 1;
    let result = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (lines[mid].time <= currentTime) {
        result = mid;
        left = mid + 1; // 继续在右半部分查找
      } else {
        right = mid - 1;
      }
    }

    return result;
  }
}
```

---

#### **6.4.2 歌词滚动平滑优化**

```vue
<!-- components/Lyrics.vue -->
<template>
  <div class="lyrics-container" ref="containerRef">
    <div
      class="lyrics-wrapper"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <p
        v-for="(line, index) in lyricLines"
        :key="index"
        :class="{ active: index === currentLineIndex }"
        class="lyric-line"
      >
        {{ line.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { LyricLine } from "@/types/entities/track";

const props = defineProps<{
  lyricLines: LyricLine[];
  currentTime: number;
}>();

const containerRef = ref<HTMLElement | null>(null);
const currentLineIndex = ref(0);

// 每行歌词高度（px）
const LINE_HEIGHT = 40;

/**
 * 计算滚动偏移量
 *
 * 目标：让当前歌词行始终显示在容器中间
 */
const offsetY = computed(() => {
  if (!containerRef.value) return 0;

  const containerHeight = containerRef.value.clientHeight;
  const centerOffset = containerHeight / 2 - LINE_HEIGHT / 2;

  return centerOffset - currentLineIndex.value * LINE_HEIGHT;
});

/**
 * 监听播放时间，更新当前歌词行
 */
watch(
  () => props.currentTime,
  (time) => {
    const index = getCurrentLineIndex(time, props.lyricLines);
    if (index !== -1) {
      currentLineIndex.value = index;
    }
  },
);

// 二分查找逻辑（同上）
function getCurrentLineIndex(time: number, lines: LyricLine[]): number {
  // ... 同 LyricService.getCurrentLineIndex
}
</script>

<style scoped>
.lyrics-container {
  height: 400px;
  overflow: hidden;
  position: relative;
}

.lyrics-wrapper {
  transition: transform 0.3s ease-out; /* 平滑滚动 */
  padding: 200px 0; /* 上下留白，让第一句和最后一句也能居中 */
}

.lyric-line {
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  transition: all 0.3s;
}

.lyric-line.active {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  transform: scale(1.1);
}
</style>
```

---

### 6.5 无限滚动（Infinite Scroll）

```typescript
// composables/useInfiniteScroll.ts
import { ref, onMounted, onUnmounted } from "vue";

interface UseInfiniteScrollOptions {
  threshold?: number; // 距离底部多少像素时触发加载（默认 300px）
  immediate?: boolean; // 是否立即执行一次加载
}

/**
 * 无限滚动 Composable
 *
 * 使用场景：
 * - 歌单列表（滚动到底部加载更多）
 * - 搜索结果（分页加载）
 * - 评论列表
 */
export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  options: UseInfiniteScrollOptions = {},
) {
  const { threshold = 300, immediate = true } = options;

  const isLoading = ref(false);
  const isFinished = ref(false); // 是否已加载完所有数据

  /**
   * 检查是否应该加载更多
   */
  function checkShouldLoad() {
    if (isLoading.value || isFinished.value) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 距离底部的距离
    const distanceToBottom = documentHeight - scrollTop - windowHeight;

    if (distanceToBottom < threshold) {
      load();
    }
  }

  /**
   * 执行加载
   */
  async function load() {
    if (isLoading.value) return;

    isLoading.value = true;

    try {
      await loadMore();
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 重置状态（用于重新加载）
   */
  function reset() {
    isFinished.value = false;
  }

  /**
   * 标记为已加载完成
   */
  function finish() {
    isFinished.value = true;
  }

  // 节流处理滚动事件
  let rafId: number | null = null;
  function handleScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      checkShouldLoad();
      rafId = null;
    });
  }

  onMounted(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    if (immediate) {
      load();
    }
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
    if (rafId) cancelAnimationFrame(rafId);
  });

  return {
    isLoading,
    isFinished,
    reset,
    finish,
    load,
  };
}
```

**使用示例**：

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";
import { searchTracks } from "@/api/modules/search";

const tracks = ref<Track[]>([]);
const page = ref(0);
const pageSize = 30;

async function loadMore() {
  const res = await searchTracks({
    keywords: "Jay Chou",
    offset: page.value * pageSize,
    limit: pageSize,
  });

  if (res.result.songs.length === 0) {
    finish(); // 没有更多数据
    return;
  }

  tracks.value.push(...res.result.songs);
  page.value++;
}

const { isLoading, isFinished, finish } = useInfiniteScroll(loadMore);
</script>

<template>
  <div>
    <TrackList :tracks="tracks" />

    <div v-if="isLoading" class="loading">加载中...</div>
    <div v-if="isFinished" class="finished">没有更多了</div>
  </div>
</template>
```

---

### 6.6 组件懒加载与代码分割

```typescript
// router/index.ts
import { createRouter, createWebHistory } from "vue-router";

/**
 * 路由懒加载
 *
 * 好处：
 * - 减小初始加载体积
 * - 按需加载，提高首屏速度
 * - Vite 会自动进行代码分割
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/Home/index.vue"), // 懒加载
    },
    {
      path: "/playlist/:id",
      name: "playlist",
      component: () => import("@/views/Playlist/index.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      // 预加载：鼠标悬停时预加载组件
      component: () =>
        import(/* webpackPrefetch: true */ "@/views/Settings/index.vue"),
    },
  ],
});

export default router;
```

---

## 总结与学习路径建议

### 1. 学习顺序

1. **基础阶段**（1-2 周）
   - Vue 3 Composition API 核心概念
   - TypeScript 基础类型与泛型
   - Vite 项目搭建与配置

2. **进阶阶段**（2-3 周）
   - Pinia 状态管理实践
   - Composables 设计模式
   - Services 层架构设计

3. **性能优化阶段**（1-2 周）
   - 虚拟列表实现原理
   - 懒加载与预加载策略
   - 内存管理与性能监控

4. **项目实战**（4-6 周）
   - 从零开始重构 YesPlayMusic
   - 边学边实践，遇到问题查阅文档
   - 定期 Code Review

### 2. 推荐资源

- **官方文档**: Vue 3、Vite、Pinia 官方文档（必读）
- **源码阅读**: Element Plus、Naive UI 等组件库源码
- **实战项目**: 完整重构 YesPlayMusic

### 3. 关键指标

衡量重构成功的标准：

- ✅ 首屏加载时间 < 1.5s
- ✅ 虚拟列表滚动帧率稳定 60fps
- ✅ TypeScript 类型覆盖率 > 90%
- ✅ 构建体积相比原项目减少 30%+
- ✅ 组件代码行数减少 20%+（得益于 Composition API）

---

**祝你学习愉快！通过这次重构，你将掌握企业级 Vue 3 项目的全流程开发能力！🚀**

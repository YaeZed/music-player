# 主页实现详细教程

> **目标**：从零开始实现 YesPlayMusic 主页，展示推荐歌单、新专辑、热门歌手和排行榜

---

## 📋 前置条件

你应该已经完成：

- ✅ 基础播放器 Demo
- ✅ 歌曲 API（`src/api/track.ts`）
- ✅ 基础类型定义（`src/types/track.ts`）

---

## 🎯 本教程将实现

**主页功能模块**：

1. 推荐歌单（10个）
2. 新专辑（10张）
3. 推荐歌手（6位）
4. 音乐排行榜（5个）

**技术要点**：

- TypeScript 类型定义
- API 封装与类型转换
- 可复用组件设计
- Composable 数据管理
- 响应式布局

---

## Step 1: 扩展类型定义

### Step 1.1: 歌单类型

**创建文件**：`src/types/playlist.ts`

```typescript
/**
 * 歌单类型定义
 */

/**
 * 歌单创建者
 */
export interface PlaylistCreator {
  userId: number;
  nickname: string;
  avatarUrl?: string;
}

/**
 * 歌单基本信息
 */
export interface Playlist {
  id: number;
  name: string;
  coverImgUrl: string; // 封面图片
  playCount?: number; // 播放次数
  trackCount?: number; // 歌曲数量
  creator?: PlaylistCreator; // 创建者
  copywriter?: string; // 文案（推荐语）
  updateFrequency?: string; // 更新频率（如"每日更新"）
  description?: string; // 描述
}

/**
 * API 原始响应 - 推荐歌单
 */
export interface RawPlaylist {
  id: number;
  name: string;
  coverImgUrl: string;
  playCount?: number;
  trackCount?: number;
  creator?: {
    userId: number;
    nickname: string;
  };
  copywriter?: string;
  updateFrequency?: string;
}

/**
 * 推荐歌单 API 响应
 */
export interface RecommendPlaylistResponse {
  code: number;
  result: RawPlaylist[];
}

/**
 * 每日推荐歌单 API 响应
 */
export interface DailyRecommendPlaylistResponse {
  code: number;
  recommend: RawPlaylist[];
}

/**
 * 所有榜单 API 响应
 */
export interface TopListsResponse {
  code: number;
  list: RawPlaylist[];
}
```

---

### Step 1.2: 专辑类型

**创建文件**：`src/types/album.ts`

```typescript
/**
 * 专辑类型定义
 */

import type { Artist } from "./artist";

/**
 * 专辑信息
 */
export interface Album {
  id: number;
  name: string;
  picUrl: string; // 封面图片
  publishTime: number; // 发布时间（时间戳）
  artist: Artist; // 主要歌手
  artists: Artist[]; // 所有歌手
  type: string; // 类型：EP/Single/专辑
  size: number; // 歌曲数量
}

/**
 * API 原始响应 - 专辑
 */
export interface RawAlbum {
  id: number;
  name: string;
  picUrl: string;
  publishTime: number;
  artist: {
    id: number;
    name: string;
  };
  artists: Array<{
    id: number;
    name: string;
  }>;
  type: string;
  size: number;
}

/**
 * 新专辑 API 响应
 */
export interface NewAlbumsResponse {
  code: number;
  albums: RawAlbum[];
}
```

---

### Step 1.3: 歌手类型

**创建文件**：`src/types/artist.ts`

```typescript
/**
 * 歌手类型定义
 */

/**
 * 歌手信息
 */
export interface Artist {
  id: number;
  name: string;
  picUrl?: string; // 歌手图片
  img1v1Url?: string; // 方形头像
}

/**
 * API 原始响应 - 歌手
 */
export interface RawArtist {
  id: number;
  name: string;
  picUrl?: string;
  img1v1Url?: string;
}

/**
 * 热门歌手榜 API 响应
 */
export interface TopListArtistsResponse {
  code: number;
  list: {
    artists: RawArtist[];
  };
}
```

---

### Step 1.4: 统一导出

**修改文件**：`src/types/index.ts`

```typescript
// 统一导出所有类型
export * from "./track";
export * from "./playlist";
export * from "./album";
export * from "./artist";
```

---

## Step 2: API 层实现

### Step 2.1: 歌单 API

**创建文件**：`src/api/playlist.ts`

```typescript
import request from "./request";
import type {
  Playlist,
  RecommendPlaylistResponse,
  DailyRecommendPlaylistResponse,
  TopListsResponse,
  RawPlaylist,
} from "@/types/playlist";

/**
 * 获取推荐歌单（未登录用户）
 * @param limit - 数量限制
 */
export async function getRecommendPlaylist(
  limit: number = 30,
): Promise<Playlist[]> {
  const res = await request.get<RecommendPlaylistResponse>("/personalized", {
    params: { limit },
  });

  return res.result.map(transformPlaylist);
}

/**
 * 获取每日推荐歌单（需要登录）
 */
export async function getDailyRecommendPlaylist(): Promise<Playlist[]> {
  const res = await request.get<DailyRecommendPlaylistResponse>(
    "/recommend/resource",
    {
      params: { timestamp: Date.now() },
    },
  );

  return (res.recommend || []).map(transformPlaylist);
}

/**
 * 获取所有榜单
 */
export async function getTopLists(): Promise<Playlist[]> {
  const res = await request.get<TopListsResponse>("/toplist");

  return res.list.map(transformPlaylist);
}

/**
 * 转换歌单数据为标准格式
 */
function transformPlaylist(raw: RawPlaylist): Playlist {
  return {
    id: raw.id,
    name: raw.name,
    coverImgUrl: raw.coverImgUrl,
    playCount: raw.playCount,
    trackCount: raw.trackCount,
    creator: raw.creator
      ? {
          userId: raw.creator.userId,
          nickname: raw.creator.nickname,
        }
      : undefined,
    copywriter: raw.copywriter,
    updateFrequency: raw.updateFrequency,
  };
}
```

---

### Step 2.2: 专辑 API

**创建文件**：`src/api/album.ts`

```typescript
import request from "./request";
import type { Album, NewAlbumsResponse, RawAlbum } from "@/types/album";

/**
 * 获取新专辑
 * @param params.area - 地区：ALL(全部)/ZH(华语)/EA(欧美)/KR(韩国)/JP(日本)
 * @param params.limit - 数量限制
 */
export async function getNewAlbums(
  params: {
    area?: "ALL" | "ZH" | "EA" | "KR" | "JP";
    limit?: number;
  } = {},
): Promise<Album[]> {
  const res = await request.get<NewAlbumsResponse>("/album/new", {
    params: {
      area: params.area || "ALL",
      limit: params.limit || 30,
    },
  });

  return res.albums.map(transformAlbum);
}

/**
 * 转换专辑数据为标准格式
 */
function transformAlbum(raw: RawAlbum): Album {
  return {
    id: raw.id,
    name: raw.name,
    picUrl: raw.picUrl,
    publishTime: raw.publishTime,
    artist: {
      id: raw.artist.id,
      name: raw.artist.name,
    },
    artists: raw.artists.map((a) => ({
      id: a.id,
      name: a.name,
    })),
    type: raw.type,
    size: raw.size,
  };
}
```

---

### Step 2.3: 歌手 API

**创建文件**：`src/api/artist.ts`

```typescript
import request from "./request";
import type { Artist, TopListArtistsResponse, RawArtist } from "@/types/artist";

/**
 * 获取热门歌手榜
 * @param type - 地区类型：1(华语)/2(欧美)/3(韩国)/4(日本)/null(全部)
 */
export async function getTopListArtists(
  type: number | null = null,
): Promise<Artist[]> {
  const params: Record<string, any> = {};
  if (type !== null) {
    params.type = type;
  }

  const res = await request.get<TopListArtistsResponse>("/toplist/artist", {
    params,
  });

  return res.list.artists.map(transformArtist);
}

/**
 * 转换歌手数据为标准格式
 */
function transformArtist(raw: RawArtist): Artist {
  return {
    id: raw.id,
    name: raw.name,
    picUrl: raw.picUrl,
    img1v1Url: raw.img1v1Url,
  };
}
```

---

## Step 3: 工具函数

### Step 3.1: 数字格式化

**创建文件**：`src/utils/format.ts`（扩展）

```typescript
// ... 之前的时间格式化函数 ...

/**
 * 格式化播放次数
 * @param count - 播放次数
 * @returns 格式化后的字符串（如：1.2万、10.5亿）
 */
export function formatPlayCount(count: number): string {
  if (count < 10000) {
    return count.toString();
  }

  if (count < 100000000) {
    return (count / 10000).toFixed(1) + "万";
  }

  return (count / 100000000).toFixed(1) + "亿";
}

/**
 * 获取专辑类型描述
 */
export function getAlbumType(album: { type: string; size: number }): string {
  if (album.type === "EP/Single") {
    return album.size === 1 ? "Single" : "EP";
  }
  if (album.type === "Single") {
    return "Single";
  }
  if (album.type === "专辑") {
    return "Album";
  }
  return album.type;
}
```

---

## Step 4: 创建 Cover 组件

### Step 4.1: Cover 组件

**创建文件**：`src/components/Cover.vue`

```vue
<template>
  <div
    class="cover"
    :class="{ 'cover-artist': type === 'artist' }"
    @click="handleClick"
  >
    <!-- 封面图片 -->
    <div class="cover-container">
      <img :src="imageUrl + '?param=512y512'" :alt="alt" loading="lazy" />

      <!-- 播放按钮（悬停显示） -->
      <div v-if="showPlayButton" class="play-button">
        <svg-icon icon-class="play" :size="playButtonSize" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

interface Props {
  id: number;
  imageUrl: string;
  type: "playlist" | "album" | "artist";
  alt?: string;
  playButtonSize?: number;
  showPlayButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  alt: "",
  playButtonSize: 22,
  showPlayButton: true,
});

const router = useRouter();

/**
 * 点击处理
 * 根据类型跳转到对应详情页
 */
function handleClick() {
  router.push(`/${props.type}/${props.id}`);
}
</script>

<style scoped lang="scss">
.cover {
  cursor: pointer;
  position: relative;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-4px);

    .play-button {
      opacity: 1;
    }
  }
}

.cover-container {
  position: relative;
  width: 100%;
  padding-bottom: 100%; // 1:1 正方形
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.cover-artist .cover-container {
  border-radius: 50%; // 歌手头像是圆形
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    background: white;
  }
}
</style>
```

**注意**：这里使用了 `svg-icon` 组件，你需要自己实现或替换为普通的播放图标。

---

## Step 5: 创建 CoverRow 组件

### Step 5.1: CoverRow 组件

**创建文件**：`src/components/CoverRow.vue`

```vue
<template>
  <div class="cover-row" :style="gridStyles">
    <div
      v-for="item in items"
      :key="item.id"
      class="cover-item"
      :class="{ 'cover-item-artist': type === 'artist' }"
    >
      <!-- 封面 -->
      <Cover
        :id="item.id"
        :image-url="getImageUrl(item)"
        :type="type"
        :play-button-size="type === 'artist' ? 26 : 22"
      />

      <!-- 文本信息 -->
      <div class="text">
        <!-- 标题 -->
        <div class="title">
          <router-link :to="`/${type}/${item.id}`">
            {{ item.name }}
          </router-link>
        </div>

        <!-- 子文本 -->
        <div v-if="type !== 'artist' && subText !== 'none'" class="info">
          <span v-html="getSubText(item)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Cover from "./Cover.vue";
import { formatPlayCount, getAlbumType } from "@/utils/format";
import type { Playlist, Album, Artist } from "@/types";

interface Props {
  items: Playlist[] | Album[] | Artist[];
  type: "playlist" | "album" | "artist";
  subText?: "none" | "copywriter" | "updateFrequency" | "artist" | "albumType";
  columnNumber?: number;
  gap?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subText: "none",
  columnNumber: 5,
  gap: "44px 24px",
});

/**
 * 网格样式
 */
const gridStyles = computed(() => ({
  "grid-template-columns": `repeat(${props.columnNumber}, 1fr)`,
  gap: props.gap,
}));

/**
 * 获取图片 URL
 */
function getImageUrl(item: any): string {
  // 歌手：优先使用 img1v1Url
  if (props.type === "artist") {
    const img1v1Url = item.img1v1Url || item.picUrl;
    // 网易云默认歌手图片，替换为通用头像
    if (img1v1Url && img1v1Url.includes("5639395138885805.jpg")) {
      return "https://p2.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg";
    }
    return img1v1Url;
  }

  // 歌单/专辑：使用 coverImgUrl 或 picUrl
  return item.coverImgUrl || item.picUrl || "";
}

/**
 * 获取子文本内容
 */
function getSubText(item: any): string {
  if (props.subText === "copywriter") {
    return item.copywriter || "";
  }

  if (props.subText === "updateFrequency") {
    return item.updateFrequency || "";
  }

  if (props.subText === "artist") {
    const artist = item.artist || item.artists?.[0];
    if (artist) {
      return `<a href="/artist/${artist.id}">${artist.name}</a>`;
    }
    return "";
  }

  if (props.subText === "albumType") {
    const type = getAlbumType(item);
    const year = new Date(item.publishTime).getFullYear();
    return `${type} · ${year}`;
  }

  return "";
}
</script>

<style scoped lang="scss">
.cover-row {
  display: grid;
}

.cover-item {
  .text {
    margin-top: 8px;

    .title {
      font-size: 16px;
      font-weight: 600;
      line-height: 20px;
      color: var(--color-text, #333);

      // 最多显示 2 行
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      word-break: break-all;

      a {
        color: inherit;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .info {
      margin-top: 4px;
      font-size: 12px;
      opacity: 0.68;
      line-height: 18px;

      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;

      a {
        color: inherit;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

.cover-item-artist {
  display: flex;
  flex-direction: column;
  text-align: center;

  .title {
    margin-top: 4px;
  }
}

/* 响应式 */
@media (max-width: 834px) {
  .cover-item .text .title {
    font-size: 14px;
  }
}
</style>
```

---

## Step 6: 创建 useHome Composable

**创建文件**：`src/composables/useHome.ts`

```typescript
import { ref } from "vue";
import { getRecommendPlaylist, getTopLists } from "@/api/playlist";
import { getNewAlbums } from "@/api/album";
import { getTopListArtists } from "@/api/artist";
import type { Playlist, Album, Artist } from "@/types";

/**
 * 主页数据管理 Composable
 */
export function useHome() {
  // State
  const loading = ref(false);
  const recommendPlaylists = ref<Playlist[]>([]);
  const newAlbums = ref<Album[]>([]);
  const topArtists = ref<Artist[]>([]);
  const topCharts = ref<Playlist[]>([]);

  /**
   * 加载主页所有数据
   */
  async function loadHomeData() {
    try {
      loading.value = true;

      console.log("📊 [useHome] Loading home data...");

      // 并行加载所有数据
      const [playlists, albums, allArtists, charts] = await Promise.all([
        // 1. 推荐歌单
        getRecommendPlaylist(10),

        // 2. 新专辑
        getNewAlbums({ area: "ALL", limit: 10 }),

        // 3. 热门歌手（全部地区）
        getTopListArtists(null),

        // 4. 所有榜单
        getTopLists(),
      ]);

      recommendPlaylists.value = playlists;
      newAlbums.value = albums;

      // 随机选择 6 位歌手
      topArtists.value = getRandomArtists(allArtists, 6);

      // 只显示指定的几个榜单
      const topChartIds = [19723756, 180106, 60198, 3812895, 60131];
      topCharts.value = charts.filter((c) => topChartIds.includes(c.id));

      console.log("✅ [useHome] Home data loaded successfully");
    } catch (error) {
      console.error("❌ [useHome] Failed to load home data:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 随机选择歌手
   */
  function getRandomArtists(artists: Artist[], count: number): Artist[] {
    const shuffled = [...artists].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  return {
    // State
    loading,
    recommendPlaylists,
    newAlbums,
    topArtists,
    topCharts,

    // Methods
    loadHomeData,
  };
}
```

---

## Step 7: 创建主页面

### Step 7.1: Home.vue

**创建文件**：`src/views/Home.vue`

```vue
<template>
  <div v-show="!loading" class="home">
    <!-- 推荐歌单 -->
    <div class="section">
      <div class="section-title">
        <span>推荐歌单</span>
        <router-link to="/explore?category=推荐歌单" class="more">
          查看更多
        </router-link>
      </div>
      <CoverRow
        :items="recommendPlaylists"
        type="playlist"
        sub-text="copywriter"
      />
    </div>

    <!-- 新专辑 -->
    <div class="section">
      <div class="section-title">
        <span>新专辑</span>
        <router-link to="/new-album" class="more"> 查看更多 </router-link>
      </div>
      <CoverRow :items="newAlbums" type="album" sub-text="artist" />
    </div>

    <!-- 推荐歌手 -->
    <div class="section">
      <div class="section-title">
        <span>推荐歌手</span>
      </div>
      <CoverRow :items="topArtists" type="artist" :column-number="6" />
    </div>

    <!-- 排行榜 -->
    <div class="section">
      <div class="section-title">
        <span>排行榜</span>
        <router-link to="/explore?category=排行榜" class="more">
          查看更多
        </router-link>
      </div>
      <CoverRow :items="topCharts" type="playlist" sub-text="updateFrequency" />
    </div>
  </div>

  <!-- 加载中 -->
  <div v-if="loading" class="loading">
    <div class="spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useHome } from "@/composables/useHome";
import CoverRow from "@/components/CoverRow.vue";

// 使用 Composable
const {
  loading,
  recommendPlaylists,
  newAlbums,
  topArtists,
  topCharts,
  loadHomeData,
} = useHome();

// 页面加载时获取数据
onMounted(() => {
  loadHomeData();
});
</script>

<style scoped lang="scss">
.home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section {
  margin-bottom: 60px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  span {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text, #333);
  }

  .more {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text, #333);
    opacity: 0.68;
    text-decoration: none;

    &:hover {
      opacity: 1;
      text-decoration: underline;
    }
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    color: #999;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式 */
@media (max-width: 1200px) {
  .home {
    max-width: 100%;
  }
}
</style>
```

---

## Step 8: 配置路由

### Step 8.1: 添加路由

**修改文件**：`src/router/index.ts`

```typescript
import { createRouter, createWebHistory } from "vue-router";
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

export default router;
```

### Step 8.2: 在 main.ts 中使用路由

**修改文件**：`src/main.ts`

```typescript
import { createApp } from "vue";
import pinia from "./stores";
import router from "./router"; // 👈 导入路由
import App from "./App.vue";

const app = createApp(App);

app.use(pinia);
app.use(router); // 👈 使用路由
app.mount("#app");
```

### Step 8.3: 修改 App.vue

**修改文件**：`src/App.vue`

```vue
<template>
  <div id="app">
    <router-view />
    <!-- 👈 使用路由视图 -->
  </div>
</template>

<script setup lang="ts">
// 无需其他代码
</script>

<style>
/* ... 全局样式 ... */
</style>
```

---

## ✅ 测试验证

### 1. 启动项目

```bash
# 确保 API 服务运行
cd NeteaseCloudMusicApi
npm start

# 启动前端
npm run dev
```

### 2. 访问主页

打开 http://localhost:5173

### 3. 检查功能

- ✅ 显示 4 个模块（推荐歌单、新专辑、推荐歌手、排行榜）
- ✅ 每个模块显示正确数量的项目
- ✅ 鼠标悬停显示播放按钮
- ✅ 点击卡片可以跳转（虽然详情页还未实现）
- ✅ 点击"查看更多"可以跳转

### 4. 控制台输出

正常情况应该看到：

```
📊 [useHome] Loading home data...
🚀 Request: GET /api/personalized
🚀 Request: GET /api/album/new
🚀 Request: GET /api/toplist/artist
🚀 Request: GET /api/toplist
✅ Response: /api/personalized {...}
✅ Response: /api/album/new {...}
✅ Response: /api/toplist/artist {...}
✅ Response: /api/toplist {...}
✅ [useHome] Home data loaded successfully
```

---

## 📁 完整文件清单

确认你已创建这些文件：

```
src/
├── types/
│   ├── index.ts          ✅ 统一导出
│   ├── playlist.ts       ✅ 新增
│   ├── album.ts          ✅ 新增
│   └── artist.ts         ✅ 新增
├── api/
│   ├── playlist.ts       ✅ 新增
│   ├── album.ts          ✅ 新增
│   └── artist.ts         ✅ 新增
├── utils/
│   └── format.ts         ✅ 扩展
├── components/
│   ├── Cover.vue         ✅ 新增
│   └── CoverRow.vue      ✅ 新增
├── composables/
│   └── useHome.ts        ✅ 新增
├── views/
│   └── Home.vue          ✅ 新增
├── router/
│   └── index.ts          ✅ 新增/修改
├── App.vue               ✅ 修改
└── main.ts               ✅ 修改
```

---

## 🎯 下一步可以做什么

1. **完善详情页**
   - 歌单详情页
   - 专辑详情页
   - 歌手详情页

2. **添加搜索功能**
   - 搜索框组件
   - 搜索结果页

3. **优化性能**
   - 图片懒加载
   - 虚拟滚动

4. **添加用户功能**
   - 登录/注册
   - 我的收藏

---

**恭喜！你已经完成了主页的实现！** 🎉

这个主页展示了如何：

- ✅ 设计清晰的类型系统
- ✅ 封装可复用的 API 层
- ✅ 构建灵活的组件
- ✅ 使用 Composable 管理业务逻辑
- ✅ 实现美观的响应式布局

需要继续实现其他功能或优化现有代码，随时告诉我！

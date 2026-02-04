# YesPlayMusic Vue 3 重构学习手册 - 第二部分

## 第三章：TypeScript 类型驱动开发

### 3.1 核心实体类型定义

#### **3.1.1 设计原则**

**为什么需要严谨的类型定义？**

1. **编译时类型检查**: 在开发阶段发现错误，而不是运行时
2. **智能提示**: IDE 自动补全，提高开发效率
3. **重构安全**: 修改类型后，所有使用该类型的地方会立即报错
4. **文档作用**: 类型定义本身就是最好的API文档

---

#### **3.1.2 Track（歌曲）实体**

**网易云 API 返回的原始数据**:

```json
{
  "id": 123456,
  "name": "歌曲名",
  "ar": [{ "id": 1, "name": "歌手名" }],
  "al": { "id": 1, "name": "专辑名", "picUrl": "..." },
  "dt": 240000,
  "fee": 8,
  "noCopyrightRcmd": null
}
```

**类型定义**:

```typescript
// types/entities/track.ts

/**
 * 歌曲实体类型
 *
 * 为什么要定义两个版本（Raw 和 标准版）？
 * - RawTrack: 与网易云 API 返回的字段完全对应（snake_case）
 * - Track: 应用内部使用的标准格式（camelCase + 语义化字段名）
 * - 在 API 层进行转换，保证应用内部类型一致性
 */

/**
 * 网易云 API 返回的原始歌曲数据
 */
export interface RawTrack {
  id: number;
  name: string;
  ar: RawArtist[]; // artists 的缩写
  al: RawAlbum; // album 的缩写
  dt: number; // duration 的缩写（毫秒）
  fee: TrackFeeType; // 付费类型
  mv: number; // MV ID（0 表示无 MV）
  no: number; // 专辑中的曲目序号
  publishTime: number; // 发布时间戳
  noCopyrightRcmd: null | { type: number; typeDesc: string }; // 无版权提示

  // 可选字段（不同接口返回的字段可能不同）
  alia?: string[]; // 别名
  tns?: string[]; // 翻译名称
  pop?: number; // 热度（0-100）

  // VIP 相关
  fee?: TrackFeeType;
  privilege?: {
    st: number; // 状态
    fl: number; // 免费试听长度
    fee: number;
    maxbr: number; // 最高音质
  };
}

/**
 * 歌曲付费类型枚举
 */
export enum TrackFeeType {
  FREE = 0, // 免费
  VIP = 1, // VIP 专属
  PURCHASED = 4, // 已购买
  VIP_OR_PURCHASED = 8, // VIP 或已购买
}

/**
 * 应用内部使用的标准化歌曲类型
 */
export interface Track {
  id: number;
  name: string;
  artists: Artist[]; // 艺术家列表
  album: Album; // 所属专辑
  duration: number; // 时长（毫秒）
  feeType: TrackFeeType; // 付费类型
  mvId: number; // MV ID
  trackNumber: number; // 专辑中的曲目序号
  publishTime: number; // 发布时间戳

  // 可选字段
  alias?: string[]; // 别名
  transNames?: string[]; // 翻译名称
  popularity?: number; // 热度

  // 播放相关（前端扩展字段，不来自 API）
  audioUrl?: string; // 音频 URL（动态获取）
  lyric?: Lyric; // 歌词数据（动态获取）
}

/**
 * 艺术家简化类型（在歌曲中使用）
 */
export interface Artist {
  id: number;
  name: string;
  alias?: string[];
  picUrl?: string;
}

/**
 * 专辑简化类型（在歌曲中使用）
 */
export interface Album {
  id: number;
  name: string;
  picUrl: string;
  artists?: Artist[];
}

/**
 * 歌词类型
 */
export interface Lyric {
  raw: string; // 原始歌词文本
  lines: LyricLine[]; // 解析后的歌词行
  hasTranslation: boolean; // 是否有翻译
}

export interface LyricLine {
  time: number; // 时间点（秒）
  text: string; // 歌词内容
  translation?: string; // 翻译（如果有）
}

/**
 * 类型转换函数
 * @param raw - API 返回的原始数据
 * @returns 标准化的 Track 对象
 */
export function transformTrack(raw: RawTrack): Track {
  return {
    id: raw.id,
    name: raw.name,
    artists: raw.ar.map((artist) => ({
      id: artist.id,
      name: artist.name,
      alias: artist.alias,
      picUrl: artist.picUrl,
    })),
    album: {
      id: raw.al.id,
      name: raw.al.name,
      picUrl: raw.al.picUrl,
    },
    duration: raw.dt,
    feeType: raw.fee,
    mvId: raw.mv || 0,
    trackNumber: raw.no,
    publishTime: raw.publishTime,
    alias: raw.alia,
    transNames: raw.tns,
    popularity: raw.pop,
  };
}
```

---

#### **3.1.3 Playlist（歌单）实体**

```typescript
// types/entities/playlist.ts

/**
 * 歌单类型
 */
export interface Playlist {
  id: number;
  name: string;
  description: string;
  coverUrl: string;
  creator: User;
  tracks: Track[]; // 完整歌曲列表
  trackIds: number[]; // 仅歌曲 ID（用于轻量级展示）
  trackCount: number; // 歌曲数量
  playCount: number; // 播放次数
  subscribedCount: number; // 订阅数
  createTime: number; // 创建时间
  updateTime: number; // 更新时间

  // 标签
  tags: string[];

  // 权限
  privacy: PlaylistPrivacy; // 隐私状态
  subscribed: boolean; // 当前用户是否已订阅
}

/**
 * 歌单隐私类型
 */
export enum PlaylistPrivacy {
  PUBLIC = 0, // 公开
  PRIVATE = 10, // 私有
}

/**
 * 用户类型（简化版）
 */
export interface User {
  id: number;
  nickname: string;
  avatarUrl: string;
  signature?: string;
  level?: number;
}
```

---

### 3.2 泛型与 Utility Types 实践

#### **3.2.1 API 响应通用类型**

```typescript
// types/api.ts

/**
 * 网易云 API 通用响应格式
 * @template T - 响应数据类型
 */
export interface ApiResponse<T = any> {
  code: number; // 状态码（200 = 成功）
  message?: string; // 错误信息
  data?: T; // 响应数据
}

/**
 * 分页响应类型
 * @template T - 列表项类型
 */
export interface PagedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  offset: number;
  limit: number;
}

/**
 * 使用示例：歌单详情 API
 */
export interface PlaylistDetailResponse extends ApiResponse<{
  playlist: RawPlaylist;
}> {}

/**
 * 使用示例：歌曲搜索 API
 */
export interface SearchTracksResponse extends ApiResponse<{
  result: PagedResponse<RawTrack>;
}> {}
```

---

#### **3.2.2 实用的 Utility Types**

```typescript
// types/utils.ts

/**
 * 将对象所有属性变为可选
 *
 * 使用场景：表单部分更新
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 示例
interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

// 只有 name 和 email 可选
type UpdateUserProfile = PartialBy<UserProfile, "name" | "email">;

/**
 * 递归地将所有属性变为只读
 *
 * 使用场景：防止意外修改常量配置
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 示例
const APP_CONFIG: DeepReadonly<{
  api: { baseUrl: string; timeout: number };
  features: { enableDarkMode: boolean };
}> = {
  api: { baseUrl: "https://api.example.com", timeout: 5000 },
  features: { enableDarkMode: true },
};

// ❌ 编译错误：Cannot assign to 'baseUrl' because it is a read-only property
// APP_CONFIG.api.baseUrl = 'xxx'

/**
 * 提取 Promise 的返回类型
 *
 * 使用场景：从异步函数推断返回类型
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// 示例
async function getTrackDetail(id: number) {
  return { id, name: "Song", artists: [] };
}

type TrackDetail = UnwrapPromise<ReturnType<typeof getTrackDetail>>;
// type TrackDetail = { id: number; name: string; artists: any[] }

/**
 * 使对象的某些属性必填
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 示例：创建歌单时，name 和 description 必填
type CreatePlaylistParams = RequireFields<
  Partial<Playlist>,
  "name" | "description"
>;
```

---

#### **3.2.3 高级类型：类型守卫**

```typescript
// types/guards.ts

/**
 * 类型守卫：判断是否为 Track 类型
 *
 * 为什么需要类型守卫？
 * - 在运行时检查对象是否符合特定类型
 * - TypeScript 编译后会擦除类型信息，需要手动判断
 */
export function isTrack(obj: any): obj is Track {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    Array.isArray(obj.artists) &&
    typeof obj.duration === "number"
  );
}

/**
 * 使用示例
 */
function handleTrack(data: unknown) {
  if (isTrack(data)) {
    // TypeScript 知道这里 data 的类型是 Track
    console.log(data.name); // ✅ 正常
  } else {
    console.error("Invalid track data");
  }
}

/**
 * 类型守卫：判断是否为错误响应
 */
export function isApiError(
  res: ApiResponse,
): res is ApiResponse & { code: number; message: string } {
  return res.code !== 200;
}

// 使用示例
async function fetchData() {
  const res = await api.getData();

  if (isApiError(res)) {
    showToast(res.message); // TypeScript 知道这里一定有 message
    return;
  }

  // 这里 TypeScript 知道 res.code === 200
  console.log(res.data);
}
```

---

## 第四章：Pinia 状态管理深度实践

### 4.1 Vuex 到 Pinia 迁移方案

#### **4.1.1 Vuex vs Pinia 对比**

| 特性                | Vuex 3/4                        | Pinia                     |
| ------------------- | ------------------------------- | ------------------------- |
| **语法风格**        | Options API                     | Composition API           |
| **TypeScript 支持** | 需要复杂的类型声明              | 原生支持，类型推断完美    |
| **Mutations**       | 必须通过 mutations 修改状态     | 无需 mutations，直接修改  |
| **模块化**          | 需要命名空间（namespace）       | 天然支持，每个 store 独立 |
| **DevTools**        | 支持                            | 支持且体验更好            |
| **代码量**          | 较多（state/mutations/actions） | 更少，更简洁              |

---

#### **4.1.2 Vuex Store 迁移示例**

**原 Vuex Store** (`store/state.js`):

```javascript
// Vuex 3 风格
export default {
  player: {
    playing: false,
    currentTrack: null,
    playlist: [],
    currentIndex: 0,
    repeatMode: 'off',
    shuffle: false,
    volume: 1,
  }
}

// store/mutations.js
export default {
  setPlaying(state, playing) {
    state.player.playing = playing
  },
  setCurrentTrack(state, track) {
    state.player.currentTrack = track
  },
  // ... 更多 mutations
}

// store/actions.js
export default {
  async playTrack({ commit, state }, trackId) {
    const track = await getTrackDetail(trackId)
    commit('setCurrentTrack', track)
    commit('setPlaying', true)
  }
}

// 组件中使用
this.$store.commit('setPlaying', true)
this.$store.dispatch('playTrack', 123)
```

**迁移后的 Pinia Store**:

```typescript
// stores/modules/player.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Track } from "@/types/entities/track";
import type { RepeatMode } from "@/types/enums";

/**
 * 播放器状态管理
 *
 * Pinia 支持两种定义方式：
 * 1. Setup Store（推荐）: 使用 Composition API 风格
 * 2. Options Store: 类似 Vuex，使用 state/getters/actions
 *
 * 这里使用 Setup Store，因为：
 * - 更灵活，可以直接使用 Composables
 * - TypeScript 类型推断更好
 * - 与 Vue 3 Composition API 风格一致
 */
export const usePlayerStore = defineStore("player", () => {
  // === State（使用 ref 定义响应式状态）===
  const playing = ref(false);
  const currentTrack = ref<Track | null>(null);
  const playlist = ref<number[]>([]);
  const currentIndex = ref(0);
  const repeatMode = ref<RepeatMode>("off");
  const shuffle = ref(false);
  const volume = ref(1);
  const progress = ref(0);

  // === Getters（使用 computed 定义计算属性）===
  /**
   * 当前播放的歌曲 ID
   */
  const currentTrackId = computed(() => currentTrack.value?.id ?? null);

  /**
   * 是否有下一首歌曲
   */
  const hasNextTrack = computed(() => {
    if (repeatMode.value === "one") return true; // 单曲循环永远有下一首
    if (repeatMode.value === "on") return true; // 列表循环永远有下一首
    return currentIndex.value < playlist.value.length - 1;
  });

  /**
   * 是否有上一首歌曲
   */
  const hasPrevTrack = computed(() => {
    if (repeatMode.value === "on") return true;
    return currentIndex.value > 0;
  });

  /**
   * 当前播放进度（格式化）
   */
  const formattedProgress = computed(() => {
    const minutes = Math.floor(progress.value / 60);
    const seconds = Math.floor(progress.value % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  });

  // === Actions（定义方法）===
  /**
   * 播放指定歌曲
   * @param trackId - 歌曲 ID
   */
  async function playTrack(trackId: number) {
    try {
      // 1. 获取歌曲详情
      const track = await getTrackDetail(trackId);

      // 2. 更新状态（Pinia 中可以直接修改，无需 mutation）
      currentTrack.value = track;
      playing.value = true;

      // 3. 更新当前索引
      const index = playlist.value.indexOf(trackId);
      if (index !== -1) {
        currentIndex.value = index;
      }

      // 4. 触发实际的音频播放（通过 Service）
      await audioService.play(track);
    } catch (error) {
      console.error("Failed to play track:", error);
      showToast("播放失败");
    }
  }

  /**
   * 播放/暂停切换
   */
  function togglePlay() {
    if (playing.value) {
      pause();
    } else {
      resume();
    }
  }

  /**
   * 暂停播放
   */
  function pause() {
    playing.value = false;
    audioService.pause();
  }

  /**
   * 恢复播放
   */
  function resume() {
    playing.value = true;
    audioService.resume();
  }

  /**
   * 播放下一首
   */
  async function playNext() {
    if (!hasNextTrack.value) {
      pause();
      return;
    }

    let nextIndex: number;
    if (repeatMode.value === "one") {
      // 单曲循环：继续播放当前歌曲
      nextIndex = currentIndex.value;
    } else if (currentIndex.value >= playlist.value.length - 1) {
      // 列表末尾：回到开头（仅在循环模式下）
      nextIndex = 0;
    } else {
      // 正常：播放下一首
      nextIndex = currentIndex.value + 1;
    }

    const nextTrackId = playlist.value[nextIndex];
    await playTrack(nextTrackId);
  }

  /**
   * 播放上一首
   */
  async function playPrev() {
    if (!hasPrevTrack.value) return;

    let prevIndex: number;
    if (currentIndex.value === 0) {
      prevIndex = playlist.value.length - 1;
    } else {
      prevIndex = currentIndex.value - 1;
    }

    const prevTrackId = playlist.value[prevIndex];
    await playTrack(prevTrackId);
  }

  /**
   * 设置播放列表
   * @param trackIds - 歌曲 ID 列表
   * @param startIndex - 从第几首开始播放
   */
  async function setPlaylist(trackIds: number[], startIndex: number = 0) {
    playlist.value = trackIds;
    currentIndex.value = startIndex;

    if (trackIds.length > 0) {
      await playTrack(trackIds[startIndex]);
    }
  }

  /**
   * 设置播放模式
   */
  function setRepeatMode(mode: RepeatMode) {
    repeatMode.value = mode;
  }

  /**
   * 切换随机播放
   */
  function toggleShuffle() {
    shuffle.value = !shuffle.value;

    // TODO: 实现随机列表逻辑（参考 PlaylistService）
  }

  /**
   * 设置音量
   * @param vol - 音量值（0-1）
   */
  function setVolume(vol: number) {
    volume.value = Math.max(0, Math.min(1, vol));
    audioService.setVolume(volume.value);
  }

  /**
   * 更新播放进度
   * @param time - 当前时间（秒）
   */
  function updateProgress(time: number) {
    progress.value = time;
  }

  /**
   * 跳转到指定进度
   * @param time - 目标时间（秒）
   */
  function seek(time: number) {
    progress.value = time;
    audioService.seek(time);
  }

  // === 返回（导出所有状态和方法）===
  return {
    // State
    playing,
    currentTrack,
    playlist,
    currentIndex,
    repeatMode,
    shuffle,
    volume,
    progress,

    // Getters
    currentTrackId,
    hasNextTrack,
    hasPrevTrack,
    formattedProgress,

    // Actions
    playTrack,
    togglePlay,
    pause,
    resume,
    playNext,
    playPrev,
    setPlaylist,
    setRepeatMode,
    toggleShuffle,
    setVolume,
    updateProgress,
    seek,
  };
});

// 组件中使用（对比 Vuex）
import { usePlayerStore } from "@/stores/modules/player";

const playerStore = usePlayerStore();

// ✅ 直接访问状态（响应式）
console.log(playerStore.playing);

// ✅ 直接修改状态（无需 commit）
playerStore.playing = true;

// ✅ 调用 action
playerStore.playTrack(123);

// ✅ 类型安全（IDE 自动补全）
playerStore.setVolume(0.5);
```

---

### 4.2 Store 之间的相互调用

**场景**：用户 Store 需要在登出时清空播放器 Store

```typescript
// stores/modules/user.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { usePlayerStore } from "./player"; // 导入其他 Store

export const useUserStore = defineStore("user", () => {
  const userInfo = ref<User | null>(null);
  const isLoggedIn = ref(false);

  /**
   * 登出
   *
   * 为什么可以直接调用其他 Store？
   * - Pinia 的 Store 是响应式的单例
   * - 可以在任何地方通过 useXxxStore() 获取实例
   * - 不需要像 Vuex 那样通过 context.dispatch 跨模块调用
   */
  function logout() {
    // 1. 清空用户信息
    userInfo.value = null;
    isLoggedIn.value = false;
    localStorage.removeItem("MUSIC_U");

    // 2. 清空播放器状态（调用其他 Store）
    const playerStore = usePlayerStore();
    playerStore.pause();
    playerStore.$reset(); // Pinia 提供的重置方法

    // 3. 跳转到登录页
    router.push("/login");
  }

  return {
    userInfo,
    isLoggedIn,
    logout,
  };
});
```

**注意事项**：

- ✅ **DO**: 在 action 中调用其他 Store 的方法
- ❌ **DON'T**: 在 getter 中调用其他 Store（可能导致循环依赖）

---

### 4.3 状态持久化（Persistence）

**使用第三方插件**: `pinia-plugin-persistedstate`

```bash
npm install pinia-plugin-persistedstate
```

```typescript
// stores/index.ts
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;
```

**在 Store 中启用持久化**:

```typescript
// stores/modules/settings.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsStore = defineStore(
  "settings",
  () => {
    const theme = ref<"light" | "dark" | "auto">("auto");
    const language = ref<"zh-CN" | "en-US">("zh-CN");
    const audioQuality = ref<"standard" | "high" | "lossless">("high");

    function setTheme(newTheme: typeof theme.value) {
      theme.value = newTheme;
    }

    return {
      theme,
      language,
      audioQuality,
      setTheme,
    };
  },
  {
    // 配置持久化
    persist: {
      key: "yesplaymusic-settings", // localStorage 的 key
      storage: localStorage, // 使用 localStorage（也可以用 sessionStorage）
      paths: ["theme", "language", "audioQuality"], // 只持久化这些字段
    },
  },
);
```

**自定义持久化逻辑**（不使用插件）:

```typescript
// utils/storePersistence.ts
import { watch } from "vue";
import type { Store } from "pinia";

/**
 * 自定义持久化插件
 *
 * 为什么要自定义？
 * - 需要加密存储敏感信息
 * - 需要选择性持久化（忽略某些字段）
 * - 需要自定义序列化逻辑
 */
export function createPersistence<T extends Store>(
  store: T,
  options: {
    key: string;
    paths?: string[];
    storage?: Storage;
    serializer?: {
      serialize: (value: any) => string;
      deserialize: (value: string) => any;
    };
  },
) {
  const {
    key,
    paths,
    storage = localStorage,
    serializer = {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
  } = options;

  // 1. 从 storage 中恢复状态
  const savedState = storage.getItem(key);
  if (savedState) {
    try {
      const parsed = serializer.deserialize(savedState);
      store.$patch(parsed);
    } catch (error) {
      console.error(`Failed to restore state for ${key}:`, error);
    }
  }

  // 2. 监听状态变化并保存
  watch(
    () => store.$state,
    (state) => {
      try {
        // 如果指定了 paths，只保存指定字段
        let dataToSave = state;
        if (paths) {
          dataToSave = paths.reduce((acc, path) => {
            acc[path] = state[path];
            return acc;
          }, {} as any);
        }

        const serialized = serializer.serialize(dataToSave);
        storage.setItem(key, serialized);
      } catch (error) {
        console.error(`Failed to persist state for ${key}:`, error);
      }
    },
    { deep: true }, // 深度监听
  );
}

// 使用示例
import { usePlayerStore } from "@/stores/modules/player";

const playerStore = usePlayerStore();
createPersistence(playerStore, {
  key: "player-state",
  paths: ["volume", "repeatMode", "shuffle"], // 只持久化这些字段
});
```

---

## 第五章：代码实现与深度注释

### 5.1 核心 Composables

#### **5.1.1 usePlayer - 统一的播放器接口**

```typescript
// composables/usePlayer.ts
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { usePlayerStore } from "@/stores/modules/player";
import { PlayerService } from "@/services/PlayerService";

/**
 * 播放器 Composable
 *
 * 为什么需要这个 Composable？
 * - 封装 Store 的复杂性，提供简洁的 API
 * - 整合 Store 和 Service 层
 * - 在组件中使用更方便（不需要直接操作 Store）
 *
 * Store vs Composable 的职责划分：
 * - Store: 管理全局状态（playing、currentTrack 等）
 * - Service: 处理复杂业务逻辑（音频播放、播放列表调度）
 * - Composable: 连接 Store 和 Service，提供组件友好的 API
 */
export function usePlayer() {
  const playerStore = usePlayerStore();
  const playerService = new PlayerService(); // 实际项目中应该通过依赖注入获取

  // 使用 storeToRefs 将 Store 的状态转为 ref
  // 为什么要用 storeToRefs？
  // - 直接解构 Store 会失去响应性
  // - storeToRefs 确保解构后的变量保持响应式
  const { playing, currentTrack, progress, volume, repeatMode } =
    storeToRefs(playerStore);

  // Getters（从 Store 中获取）
  const currentTrackId = computed(() => playerStore.currentTrackId);
  const hasNext = computed(() => playerStore.hasNextTrack);
  const hasPrev = computed(() => playerStore.hasPrevTrack);

  // Actions
  async function play(trackId: number) {
    await playerService.playTrack(trackId);
  }

  function togglePlay() {
    playerStore.togglePlay();
  }

  function next() {
    playerStore.playNext();
  }

  function prev() {
    playerStore.playPrev();
  }

  function seek(time: number) {
    playerStore.seek(time);
  }

  function setVolume(vol: number) {
    playerStore.setVolume(vol);
  }

  function toggleRepeatMode() {
    const modes: RepeatMode[] = ["off", "on", "one"];
    const currentIndex = modes.indexOf(repeatMode.value);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    playerStore.setRepeatMode(nextMode);
  }

  return {
    // State
    playing,
    currentTrack,
    progress,
    volume,
    repeatMode,

    // Getters
    currentTrackId,
    hasNext,
    hasPrev,

    // Actions
    play,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleRepeatMode,
  };
}
```

**组件中使用**:

```vue
<script setup lang="ts">
import { usePlayer } from "@/composables/usePlayer";

const { playing, currentTrack, progress, togglePlay, next, prev } = usePlayer();
</script>

<template>
  <div class="player">
    <div class="track-info">
      <img :src="currentTrack?.album.picUrl" alt="" />
      <div>
        <h3>{{ currentTrack?.name }}</h3>
        <p>{{ currentTrack?.artists.map((a) => a.name).join(", ") }}</p>
      </div>
    </div>

    <div class="controls">
      <button @click="prev">⏮️</button>
      <button @click="togglePlay">{{ playing ? "⏸️" : "▶️" }}</button>
      <button @click="next">⏭️</button>
    </div>

    <div class="progress">
      <span>{{ formatTime(progress) }}</span>
      <input
        type="range"
        :value="progress"
        @input="seek($event.target.value)"
      />
      <span>{{ formatTime(currentTrack?.duration / 1000) }}</span>
    </div>
  </div>
</template>
```

---

### 5.2 Vite 配置详解

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],

  /**
   * 路径别名配置
   *
   * 作用：允许使用 @/xxx 代替相对路径 ../../xxx
   */
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@api": resolve(__dirname, "src/api"),
      "@stores": resolve(__dirname, "src/stores"),
      "@utils": resolve(__dirname, "src/utils"),
    },
  },

  /**
   * 开发服务器配置
   */
  server: {
    port: 3000,
    host: true, // 允许外部访问
    open: true, // 自动打开浏览器

    /**
     * 代理配置
     *
     * 为什么需要代理？
     * - 解决跨域问题（网易云 API 不允许直接从浏览器访问）
     * - 开发环境下将 /api 开头的请求代理到本地 NeteaseCloudMusicApi 服务
     */
    proxy: {
      "/api": {
        target: "http://localhost:3001", // NeteaseCloudMusicApi 服务地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  /**
   * 构建配置
   */
  build: {
    outDir: "dist",
    sourcemap: false, // 生产环境不生成 sourcemap

    /**
     * 代码分割
     *
     * 为什么要分割？
     * - 减小单个文件体积，加快首屏加载
     * - 利用浏览器缓存（第三方库不常变化）
     */
    rollupOptions: {
      output: {
        manualChunks: {
          "vue-vendor": ["vue", "vue-router", "pinia"],
          "audio-vendor": ["howler"],
          "utils-vendor": ["axios", "dayjs", "lodash-es"],
        },
      },
    },

    /**
     * 压缩配置
     */
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true,
      },
    },
  },
});
```

---

本手册的第二部分到此结束。接下来请告诉我是否需要继续生成第三部分（性能优化与进阶技巧），或者对当前内容有任何疑问或修改建议！

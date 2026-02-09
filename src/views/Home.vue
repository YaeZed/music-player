<template>
  <div class="home">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { usePlayer } from "@/composables/usePlayer";
import { useLyrics } from "@/composables/useLyrics";
import { formatTime } from "@/utils/format";

const DEMO_TRACK_ID = 2153739112;

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

<template>
  <div v-show="!loading" class="home">
    <!-- 推荐歌单 -->
    <div class="section">
      <div class="section-title">
        <span>推荐歌单</span>
        <!-- <router-link to="/explore?category=推荐歌单" class="more">
          查看更多
        </router-link> -->
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
        <!-- <router-link to="/new-album" class="more"> 查看更多 </router-link> -->
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
        <!-- <router-link to="/explore?category=排行榜" class="more">
          查看更多
        </router-link> -->
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

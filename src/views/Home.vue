<template>
  <div class="home">
    <!-- 是否展示apple music的歌单 -->
    <div v-if="showPlaylistsByAppleMusic" class="index-row first-row">
      <div class="title">by Apple Music</div>
      <!-- 固定字符串不加：，变量加： -->
      <CoverRow
        type="playlist"
        :items="byAppleMusic"
        sub-text="appleMusic"
        :image-size="1024"
      />
    </div>

    <!-- 推荐歌单 -->
    <div class="index-row">
      <div class="title">
        {{ $t("home.recommendPlaylist") }}
        <!-- <router-link to="/explore?category=推荐歌单">{{
          $t('home.seeMore')
        }}</router-link> -->
      </div>
      <CoverRow
        type="playlist"
        :items="recommendPlaylists"
        sub-text="copywriter"
      />
    </div>

    <!--  个人推荐-->
    <div class="index-row">
      <div class="title">For You</div>
      <div class="for-you-row">
        <DailyTracksCard />
        <FMCard />
      </div>
    </div>

    <!-- 推荐歌手 -->
    <div class="index-row">
      <div class="title">{{ $t("home.recommendArtist") }}</div>
      <CoverRow type="artist" :column-number="6" :items="topArtists" />
    </div>

    <!-- 新专辑 -->
    <div class="index-row">
      <div class="title">
        {{ $t("home.newAlbum") }}
        <!-- <router-link to="/new-album">{{ $t('home.seeMore') }}</router-link> -->
      </div>
      <CoverRow type="album" :items="newAlbums" sub-text="artist" />
    </div>

    <!-- 排行榜 -->
    <div class="index-row">
      <div class="title">
        {{ $t("home.charts") }}
        <!-- <router-link to="/explore?category=排行榜">{{
          $t('home.seeMore')
        }}</router-link> -->
        <router-link to="#">{{ $t("home.seeMore") }}</router-link>
      </div>
      <CoverRow
        type="playlist"
        :items="topCharts"
        sub-text="updateFrequency"
        :image-size="1024"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "@/stores/modules/settings";
import { byAppleMusic as staticByAppleMusic } from "@/utils/staticData";
import { useHome } from "@/composables/useHome";
import CoverRow from "@/components/CoverRow.vue";
import DailyTracksCard from "@/components/DailyTracksCard.vue";
import FMCard from "@/components/FMCard.vue";

// 1. 初始化 store 并提取状态
const settingsStore = useSettingsStore();
const { recommendPlaylists, loadHomeData, topArtists, newAlbums, topCharts } =
  useHome();

// 核心点：使用 storeToRefs 保证响应式，并直接从 Store 拿到开解构出来的状态
const { showPlaylistsByAppleMusic } = storeToRefs(settingsStore);

// 2. 数据处理：包装成计算属性
const byAppleMusic = computed(() => staticByAppleMusic);

// 生命周期钩子：挂载时加载数据
onMounted(() => {
  loadHomeData();
});
</script>

<style scoped lang="scss">
.index-row {
  margin-top: 54px;
}
.index-row.first-row {
  margin-top: 32px;
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  a {
    font-size: 13px;
    font-weight: 600;
    opacity: 0.68;
  }
}
.for-you-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 78px;
}
</style>

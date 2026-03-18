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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "@/stores/modules/settings";
import { byAppleMusic as staticByAppleMusic } from "@/utils/staticData";
import CoverRow from "@/components/CoverRow.vue";

// 1. 初始化 store 并提取状态
const settingsStore = useSettingsStore();

// 核心点：使用 storeToRefs 保证响应式，并直接从 Store 拿到开解构出来的状态
const { showPlaylistsByAppleMusic } = storeToRefs(settingsStore);

// 2. 数据处理：包装成计算属性
const byAppleMusic = computed(() => staticByAppleMusic);
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
</style>

<template>
  <span class="artist-in-line">
    {{ computedPrefix }}
    <span v-for="(ar, index) in filteredArtists" :key="ar.id || index">
      <!-- 只有 ID 不为 0 且存在时才生成链接 -->
      <!-- <router-link v-if="ar.id" :to="`/artist/${ar.id}`">
        {{ ar.name }}
      </router-link> -->
      <span v-if="ar.id" :to="`/artist/${ar.id}`">
        {{ ar.name }}
      </span>
      <span v-else>{{ ar.name }}</span>

      <!-- 最后一个艺人之后不加逗号 -->
      <span v-if="index !== filteredArtists.length - 1" class="separator"
        >,</span
      >
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
// 定义艺人接口
interface Artist {
  id: number;
  name: string;
}
const props = withDefaults(
  defineProps<{
    artists: Artist[];
    exclude?: string;
    prefix?: string;
  }>(),
  {
    exclude: "",
    prefix: "",
  },
);
// 过滤掉需要排除的艺人
const filteredArtists = computed(() => {
  return props.artists.filter((a) => a.name !== props.exclude);
});
// 只有在有艺人显示时才显示前缀
const computedPrefix = computed(() => {
  return filteredArtists.value.length !== 0 ? props.prefix : "";
});
</script>
<style lang="scss" scoped>
.separator {
  margin-left: 1px;
  margin-right: 4px;
  position: relative;
  top: 0.5px;
}
</style>

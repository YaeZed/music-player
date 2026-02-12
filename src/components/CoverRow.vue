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
import type { Album } from "@/types/entities/album";
import type { Playlist } from "@/types/entities/playlist";
import type { Artist } from "@/types/entities/artist";

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
const getImageUrl = (item: any): string => {
  // 歌手：优先使用 img1v1Url
  if (props.type === "artist") {
    const img1v1Url = item.img1v1Url || item.picUrl;
    // 网易云默认歌手图片，替换为通用头像
    if (img1v1Url && img1v1Url.includes("5639395138885805.jpg")) {
      return "https://p2.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg";
    }
    return img1v1Url;
  }

  return item.picUrl || item.img1v1Url || item.coverImgUrl || "";
};

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

<template>
  <div class="cover-row">
    <div
      v-for="item in props.items"
      :key="item.id"
      class="item"
      :class="{ artist: props.type === 'artist' }"
    >
      <Cover
        :id="item.id"
        :image-url="getImageUrl(item)"
        :type="props.type"
        :play-button-size="props.type === 'artist' ? 26 : props.playButtonSize"
      />
      <div class="text">
        <div v-if="showPlayCount" class="info">
          <!-- <span class="play-count"
            ><svg-icon icon-class="play" />{{
              item.playCount | formatPlayCount
            }}
          </span> -->
        </div>
        <div class="title">
          <!-- 显式内容图标 -->
          <span v-if="isExplicit(item)" class="explicit-symbol">
            <ExplicitSymbol />
          </span>

          <!-- 私密锁定图标 -->
          <span v-if="isPrivacy(item)" class="lock-icon">
            <svg-icon icon-class="lock" />
          </span>

          <!-- 标题链接（暂时置为 #） -->
          <router-link :to="'#'">{{ item.name }}</router-link>
        </div>
        <div
          v-if="props.type !== 'artist' && props.subText !== 'none'"
          class="info"
        >
          <!-- 使用 v-html 渲染包含链接的字符串 -->
          <span v-html="getSubText(item)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Playlist } from "@/types/entities/playlist";
import Cover from "./Cover.vue";
import ExplicitSymbol from "./ExplicitSymbol.vue";
// 组件接收的属性
const props = withDefaults(
  defineProps<{
    items: Playlist[];
    columnNumber?: number; //列数
    gap?: string;
    type?: string;
    playButtonSize?: number;
    coverHover?: boolean;
    alwaysShowShadow?: boolean;
    showPlayCount?: boolean;
    subTextFontSize?: number;
    subText?: string;
  }>(),
  {
    columnNumber: 5,
    gap: "44px 24px",
    type: "playlist",
    items: () => [],
    playButtonSize: 20,
    subTextFontSize: 16,
  },
);

// methods
const getImageUrl = (item: Playlist) => {
  if (item.img1v1Url) {
    let img1v1ID = item.img1v1Url.split("/");
    let img = img1v1ID[img1v1ID.length - 1];
    if (img === "5639395138885805.jpg") {
      // 没有头像的歌手，网易云返回的img1v1Url并不是正方形的
      return "https://p2.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg?param=512y512";
    }
  }
  let img = item.img1v1Url || item.picUrl || item.coverImgUrl;
  return `${img?.replace("http://", "https://")}?param=512y512`;
};
/**
 * 检查是否为显式内容 (Explicit)
 * 逻辑：类型为专辑且 mark 包含特定位掩码
 */
const isExplicit = (item: any) => {
  return props.type === "album" && (item.mark & 1048576) === 1048576;
};
/**
 * 检查是否为私密歌单 (Privacy)
 * 逻辑：类型为歌单且隐私级别为 10
 */
const isPrivacy = (item: any) => {
  return props.type === "playlist" && item.privacy === 10;
};

/**
 * 获取副标题内容
 * @param item 传入的数据项
 */
const getSubText = (item: any): string | number => {
  if (props.subText === "copywriter") return item.copywriter;
  if (props.subText === "description") return item.description;
  if (props.subText === "updateFrequency") return item.updateFrequency;

  if (props.subText === "creator") return `by ${item.creator.nickname}`;

  if (props.subText === "releaseYear") {
    return new Date(item.publishTime).getFullYear();
  }

  if (props.subText === "artist") {
    const artist = item.artist || (item.artists && item.artists[0]);
    if (artist) {
      // 注意：使用 v-html 时保留 <a> 标签，跳转由路由接管或刷新
      return `<a href="/artist/${artist.id}">${artist.name}</a>`;
    }
  }

  if (props.subText === "albumType+releaseYear") {
    let albumType = item.type;
    if (item.type === "EP/Single") {
      albumType = item.size === 1 ? "Single" : "EP";
    } else if (item.type === "Single") {
      albumType = "Single";
    } else if (item.type === "专辑") {
      albumType = "Album";
    }
    const year = new Date(item.publishTime).getFullYear();
    return `${albumType} · ${year}`;
  }

  if (props.subText === "appleMusic") return "by Apple Music";

  return "";
};
</script>

<style scoped lang="scss">
.cover-row {
  display: grid;
  grid-template-columns: repeat(v-bind("props.columnNumber"), 1fr);
  gap: v-bind("props.gap");
}

.item {
  color: var(--color-text);
  .text {
    margin-top: 8px;
    .title {
      font-size: v-bind("props.subTextFontSize + 'px'");
      font-weight: 600;
      line-height: 20px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      word-break: break-all;
    }
    .info {
      font-size: 12px;
      opacity: 0.68;
      line-height: 18px;
      /* 文字两行显示 */
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      word-break: break-word;

      /* 针对 v-html 渲染出来的链接进行样式修饰 */
      :deep(a) {
        color: inherit;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

.item.artist {
  display: flex;
  flex-direction: column;
  text-align: center;
  .cover {
    display: flex;
  }
  .title {
    margin-top: 4px;
  }
}
@media (max-width: 834px) {
  .item .text .title {
    font-size: 14px;
  }
}

.explicit-symbol {
  opacity: 0.28;
  color: var(--color-text);
  float: right;
  .svg-icon {
    margin-bottom: -3px;
  }
}

.lock-icon {
  opacity: 0.28;
  color: var(--color-text);
  margin-right: 4px;
  // float: right;
  .svg-icon {
    height: 12px;
    width: 12px;
  }
}

.play-count {
  font-weight: 600;
  opacity: 0.58;
  color: var(--color-text);
  font-size: 12px;
  .svg-icon {
    margin-right: 3px;
    height: 8px;
    width: 8px;
  }
}
</style>

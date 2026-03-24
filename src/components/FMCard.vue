<template>
  <div class="fm" :style="{ background }" data-theme="dark">
    <!-- 预加载下一张封面 -->
    <img :src="nextTrackCover" style="display: none" loading="lazy" />
    <img
      class="cover"
      :src="track?.album?.picUrl"
      loading="lazy"
      @click="goToAlbum"
    />
    <div v-if="track" class="right-part">
      <div class="info">
        <div class="title">{{ track?.name }}</div>
        <div class="artist">
          <ArtistsInLine v-if="track?.artists" :artists="track.artists" />
        </div>
      </div>
      <div class="controls">
        <div class="buttons">
          <button-icon title="不喜欢" @click.native="moveToFMTrash">
            <svg-icon id="thumbs-down" icon-class="thumbs-down" />
          </button-icon>
          <button-icon
            :title="$t(isPlaying ? 'player.pause' : 'player.play')"
            class="play"
            @click.native="play"
          >
            <svg-icon :icon-class="isPlaying ? 'pause' : 'play'" />
          </button-icon>
          <button-icon :title="$t('player.next')" @click.native="next">
            <svg-icon icon-class="next" />
          </button-icon>
        </div>
        <div class="card-name"><svg-icon icon-class="fm" />私人FM</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { usePlayInformation } from "@/stores/modules/playInformation";
import { storeToRefs } from "pinia";
import ArtistsInLine from "./ArtistsInLine.vue";
import ButtonIcon from "./ButtonIcon.vue";
import { Vibrant } from "node-vibrant/browser";
import Color from "color";

const playStore = usePlayInformation();
const { _personalFMNextTrack, _personalFMTrack } = storeToRefs(playStore);

const isPlaying = ref(false);
const background = ref("");

const nextTrackCover = computed(() => {
  // 安全检查：防止数据还没回来时，replace 报 undefined 的错
  const picUrl = _personalFMNextTrack.value?.album?.picUrl;
  if (!picUrl) return "";

  return `${picUrl.replace("http://", "https://")}?param=512y512`;
});

const track = computed(() => {
  return _personalFMTrack.value;
});

// method
// 提取并计算背景颜色
const getColor = () => {
  const picUrl = track.value?.album?.picUrl;
  if (!picUrl) return;
  const cover = `${picUrl.replace("http://", "https://")}?param=512y512`;
  Vibrant.from(cover)
    .maxColorCount(16)
    .getPalette()
    .then((palette) => {
      const v = palette.Vibrant;
      if (!v) return;
      const color = Color.rgb(v.rgb).darken(0.1).rgb().string();
      const color2 = Color.rgb(v.rgb).lighten(0.28).rotate(-30).rgb().string();
      // 更新 background
      background.value = `linear-gradient(to top left, ${color}, ${color2})`;
    });
};
const goToAlbum = () => {};
const moveToFMTrash = () => {};
const play = () => {};
const next = () => {};

// 监听歌曲变化并更新背景
watch(track, () => {
  getColor();
});

// onMounted
onMounted(() => {
  playStore.getPersonalFM();
  getColor();
});
</script>

<style lang="scss" scoped>
.fm {
  padding: 1rem;
  background: var(--color-secondary-bg);
  border-radius: 1rem;
  display: flex;
  height: 198px;
  box-sizing: border-box;
}
.cover {
  height: 100%;
  clip-path: border-box;
  border-radius: 0.75rem;
  margin-right: 1.2rem;
  cursor: pointer;
  user-select: none;
}
.right-part {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color-text);
  width: 100%;
  .title {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }
  .artist {
    opacity: 0.68;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-left: -0.4rem;
    .buttons {
      display: flex;
    }
    .button-icon {
      margin: 0 8px 0 0;
    }
    .svg-icon {
      width: 24px;
      height: 24px;
    }
    .svg-icon#thumbs-down {
      width: 22px;
      height: 22px;
    }
    .card-name {
      font-size: 1rem;
      opacity: 0.18;
      display: flex;
      align-items: center;
      font-weight: 600;
      user-select: none;
      .svg-icon {
        width: 18px;
        height: 18px;
        margin-right: 6px;
      }
    }
  }
}
</style>

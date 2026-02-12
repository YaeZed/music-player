<template>
  <div
    class="cover"
    :class="{ 'cover-artist': type === 'artist' }"
    @click="handleClick"
  >
    <!-- 封面图片 -->
    <div class="cover-container">
      <img :src="imageUrl" :alt="alt" loading="lazy" />

      <!-- 播放按钮（悬停显示） -->
      <div v-if="showPlayButton" class="play-button">
        <svg-icon icon-class="play" :size="playButtonSize" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
// function handleClick() {
//   router.push(`/${props.type}/${props.id}`);
// }
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

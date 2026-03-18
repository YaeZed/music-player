<template>
  <div
    class="cover"
    :class="{ 'cover-hover': coverHover }"
    @mouseover="focus = true"
    @mouseleave="focus = false"
    @click="clickCoverToPlay ? play() : goTo()"
  >
    <div class="cover-container">
      <div class="shade">
        <button v-show="focus" class="play-button" @click.stop="play()">
          <svg-icon icon-class="play" size="25"></svg-icon>
        </button>
      </div>
      <img :src="imageUrl" loading="lazy" />
      <transition v-if="props.coverHover || props.alwaysShowShadow" name="fade">
        <div v-show="focus || props.alwaysShowShadow" class="shadow"></div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
// 组件接收的属性
const props = withDefaults(
  defineProps<{
    type?: string;
    fixedSize?: number;
    coverHover?: boolean;
    clickCoverToPlay?: boolean;
    playButtonSize?: number;
    imageUrl?: string;
    alwaysShowShadow?: boolean;
  }>(),
  {
    coverHover: true,
  },
);
const focus = ref(false);

// computed
// 1.接收按钮的尺寸，转换为带单位的字符串
const playButtonStyle = computed(() => {
  return `${props.playButtonSize ?? 20}%`;
});

// 图片处理
// 尺寸：如果有 fixedSize 就用 px，否则 100%
const imgSize = computed(() => {
  if (props.fixedSize) {
    return `${props.fixedSize}px`;
  }
  return "100%";
});
// 圆角：艺人类型强制 50%，否则使用默认值 0.75em 或自定义 radius
const imgRadius = computed(() => {
  if (props.type === "artist") {
    return "50%";
  }
  return "0.75em";
});

// 毛玻璃
// 设置阴影背景图
const shadeBackground = computed(() => {
  return `url("${props.imageUrl}")`;
});
// 设置阴影圆角（与主图保持一致）
const shadeRadius = computed(() => {
  if (props.type === "artist") {
    return "50%";
  }
  return "0.75em";
});

// methods
const play = () => {};
const goTo = () => {};
</script>

<style scoped lang="scss">
.cover {
  position: relative;
  transition: transform 0.3s;
  // 建立根级堆栈上下文
  z-index: 1;
}

.cover-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

img {
  border-radius: v-bind(imgRadius);
  width: v-bind(imgSize);
  user-select: none;
  aspect-ratio: 1 / 1;
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  // 图片在阴影之上，但在遮罩/按钮之下
  z-index: 2;
}

.cover-hover {
  &:hover {
    cursor: pointer;
  }
}

.shade {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  // 确保遮罩和按钮在最顶层
  z-index: 3;
}

.play-button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  // 强化的毛玻璃效果
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  backdrop-filter: blur(12px) saturate(160%);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: v-bind(playButtonStyle);
  width: v-bind(playButtonStyle);
  border-radius: 50%;
  cursor: default;
  transition: 0.2s;

  .svg-icon {
    width: 65%;
    margin-left: 3px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.94);
  }
}

.shadow {
  /* 动态圆角 */
  border-radius: v-bind(shadeRadius);
  position: absolute;
  // 阴影稍微下移
  top: 12px;
  height: 100%;
  width: 100%;
  // 强力模糊和不透明度
  filter: blur(20px) opacity(0.8);
  // 阴影略微放大或保持原大，确保模糊部分可见
  transform: scale(1);
  // 必须在图片层级之下
  background-image: v-bind(shadeBackground);
  z-index: -1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  aspect-ratio: 1 / 1;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

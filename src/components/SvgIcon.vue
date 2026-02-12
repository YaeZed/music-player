<template>
  <svg :class="svgClass" :style="svgStyle" aria-hidden="true">
    <use :href="iconName"></use>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  iconClass: string;
  className?: string;
  size?: number | string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  className: "",
  size: 16,
  color: "currentColor",
});

// 计算属性
const iconName = computed(() => `#icon-${props.iconClass}`);

const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`;
  }
  return "svg-icon";
});

const svgStyle = computed(() => {
  const size = typeof props.size === "number" ? `${props.size}px` : props.size;
  return {
    width: size,
    height: size,
    fill: props.color,
  };
});
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  overflow: hidden;
}
</style>

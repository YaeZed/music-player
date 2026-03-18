<template>
  <svg-icon icon-class="explicit" class="explicit-symbol"></svg-icon>
</template>

<script setup lang="ts">
import SvgIcon from "@/components/SvgIcon.vue";

// 1. 定义 Props 并设置默认值
const props = withDefaults(
  defineProps<{
    size?: number;
  }>(),
  {
    size: 16,
  },
);
</script>

<style lang="scss" scoped>
.explicit-symbol {
  /* 2. 直接在 CSS 中使用 v-bind 绑定 Props 变量 */
  height: v-bind('props.size + "px"');
  width: v-bind('props.size + "px"');

  /* 3. 其他静态样式 */
  position: relative;
  left: -1px;
}
</style>

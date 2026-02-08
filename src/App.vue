<template>
  <div>
    <button @click="play">{{ buttonTxt }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePlayerStore } from "./stores/modules/player";

const playerStore = usePlayerStore();
const buttonTxt = computed(() => {
  if (playerStore.playing) {
    return "⏹️";
  } else {
    return "▶️";
  }
});
const play = () => {
  playerStore
    .playTrack(123456)
    .then(() => console.log("播放成功"))
    .catch((err) => console.log("播放失败", err));
};
console.log("播放中:", playerStore.playing);
console.log("当前歌曲:", playerStore.currentTrackName);
</script>

<style scoped></style>

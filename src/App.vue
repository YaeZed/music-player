<template>
  <div></div>
</template>

<script setup lang="ts">
import { getTrackDetail } from "./api/modules/track";

getTrackDetail(123456).then((tracks) => {
  console.log(tracks[0]?.name);
});
</script>

<style scoped></style>

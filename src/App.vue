<template>
  <div id="app">
    <Home />
  </div>
</template>

<script setup lang="ts">
import Home from "./views/Home.vue";
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, "Noto Sans", sans-serif;
  background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  padding: 20px;
}
</style>

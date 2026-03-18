<template>
  <div id="app">
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
#app {
  width: 100%;
  transition: all 0.4s;
}
.main {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  overflow: auto;
  padding: 64px 10vw 96px 10vw;
  box-sizing: border-box;
  scrollbar-width: none;
}
@media (max-width: 1336px) {
  .main {
    padding: 64px 5vw 96px 5vw;
  }
}
</style>

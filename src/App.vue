<script setup lang="ts">
import { ref } from 'vue';
const button_text = ref('点击跳转到 GitHub 仓库')
const onClick = () => {
  button_text.value = '跳转中……'
}
</script>

<template>
  <img src="/bg.svg" class="logo" alt="Vite logo" />
  s<a href="https://github.com/SilianZ/bad-pages"><button @click="onClick">{{ button_text }}</button></a>
</template>

<style scoped>
.logo{
  height: auto;
  width: auto;
}
</style>

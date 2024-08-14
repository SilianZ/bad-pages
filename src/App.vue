<script setup lang="ts">
import { ref } from 'vue';
const button_text = ref('点击跳转到 GitHub 仓库')
const onClick = () => {
  button_text.value = "跳转中……"
}
</script>

<template>
  <img src="/bg.svg" class="logo" alt="Vite logo" />
  <a href="https://github.com/SilianZ/bad-pages"><button @click="onClick">{{ button_text }}</button></a>
</template>

<style scoped>
.logo{
  height: auto;
  width: auto;
}
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
  color: #ffffff;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import viteLogoUrl from './assets/vite.svg'
import vueLogoUrl from './assets/vue.svg'

const count = ref(0)
</script>

<template>
  <div
    class="flex flex-col gap-4 p-8 text-center rounded-2xl flex justify-center items-center fixed bottom-[70px] right-5 bg-black border! border-[#5384ed] border-solid"
  >
    <div class="flex items-center gap-4">
      <a href="https://vite.dev" target="_blank">
        <img :src="viteLogoUrl" alt="Vite logo" />
      </a>
      <span class="text-2xl font-bold">+</span>
      <a href="https://vuejs.org/" target="_blank">
        <img :src="vueLogoUrl" alt="Vue logo" />
      </a>
    </div>
    <button
      class="counter rounded-lg border! border-solid border-[#3e3e3e] px-5! py-2.5! text-base text-white font-medium font-inherit bg-[#1a1a1a] cursor-pointer transition-colors duration-250 hover:text-[#5384ed]! hover:border-[#5384ed]! border-solid"
      @click="count++"
    >
      {{ count }}
    </button>
  </div>
</template>

<style scoped></style>

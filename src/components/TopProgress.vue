<template>
  <div
    class="pointer-events-none fixed left-0 top-0 z-50 h-[2px] w-full"
    aria-hidden="true"
  >
    <div
      class="h-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)] transition-[width,opacity] duration-200 ease-out"
      :style="{ width: `${width}%`, opacity: visible ? 1 : 0 }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  width: number
  visible: boolean
}>()
</script>


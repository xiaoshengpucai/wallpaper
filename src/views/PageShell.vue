<template>
  <div class="grid min-h-[50vh] place-items-center max-[899px]:min-h-[40vh] max-[899px]:px-3 max-[899px]:py-8">
    <div class="text-center max-[899px]:w-full max-[899px]:max-w-lg">
      <div
        class="text-3xl font-semibold tracking-wide max-[899px]:text-2xl max-[899px]:sm:text-3xl"
        :class="themeLight ? 'text-blue-700' : 'text-white'"
      >
        {{ title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'

defineProps<{ title: string }>()

const appThemeLight = inject<Ref<boolean> | undefined>('appThemeLight', undefined)
const themeLight = computed(() => appThemeLight?.value === true)
</script>


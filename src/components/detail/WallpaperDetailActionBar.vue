<template>
  <div
    class="flex w-full shrink-0 flex-wrap items-stretch"
    :class="[
      narrow ? 'flex-col sm:flex-row' : 'flex-row',
      compact ? 'gap-2' : 'gap-3',
    ]"
  >
    <button
      type="button"
      class="inline-flex flex-1 items-center justify-center gap-1.5 border font-semibold tracking-tight backdrop-blur-xl transition disabled:cursor-not-allowed disabled:opacity-55"
      :class="[
        compact ? 'min-h-[32px] rounded-lg px-2 text-[12px]' : 'min-h-[48px] rounded-2xl px-4 text-[15px]',
        themeLight
          ? 'border-slate-300/55 bg-white/60 text-slate-800 hover:bg-white/80'
          : 'border-white/14 bg-white/[0.09] text-white/92 hover:bg-white/[0.14]',
      ]"
      :disabled="downloadPending || downloadDisabled"
      @click="$emit('download')"
    >
      <span :class="compact ? 'text-xs leading-none' : 'text-lg leading-none'" aria-hidden="true">↓</span>
      {{ downloadPending ? '下载中…' : '下载' }}
    </button>
    <button
      type="button"
      class="inline-flex flex-1 items-center justify-center gap-1.5 border font-semibold tracking-tight backdrop-blur-xl transition disabled:cursor-not-allowed disabled:opacity-55"
      :class="[
        compact ? 'min-h-[32px] rounded-lg px-2 text-[12px]' : 'min-h-[48px] rounded-2xl px-4 text-[15px]',
        favorited
          ? themeLight
            ? 'border-amber-400/60 bg-amber-50/85 text-amber-900 hover:bg-amber-50'
            : 'border-amber-300/35 bg-amber-500/20 text-amber-50 hover:bg-amber-500/25'
          : themeLight
            ? 'border-slate-300/55 bg-white/60 text-slate-800 hover:bg-white/80'
            : 'border-white/14 bg-white/[0.09] text-white/92 hover:bg-white/[0.14]',
      ]"
      :disabled="favoritePending"
      @click="$emit('toggle-favorite')"
    >
      <span :class="compact ? 'text-xs leading-none' : 'text-lg leading-none'" aria-hidden="true">{{ favorited ? '★' : '☆' }}</span>
      {{ favoritePending ? '处理中…' : favorited ? '已收藏' : '收藏' }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  themeLight: boolean
  /** 当前是否已收藏 */
  favorited: boolean
  downloadPending?: boolean
  favoritePending?: boolean
  /** 无有效下载地址时禁用 */
  downloadDisabled?: boolean
  /** 窄屏时按钮纵向堆叠 */
  narrow?: boolean
  /** 移动端紧凑模式：缩小按钮高度和字号 */
  compact?: boolean
}>()

defineEmits<{
  download: []
  'toggle-favorite': []
}>()
</script>

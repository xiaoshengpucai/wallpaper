<template>
  <div
    class="flex h-full min-h-0 w-full flex-col rounded-[clamp(22px,4vw,36px)] border border-white/25 bg-black/50 px-4 pb-4 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_0_0_1px_rgba(255,255,255,0.06)] max-[899px]:rounded-[12px] max-[899px]:px-3 max-[899px]:pb-3 max-[899px]:pt-3 min-[900px]:justify-end"
  >
    <!-- 标签区：仅 Web；不换行滚动，靠缩小字号与换行完整展示 -->
    <div
      class="flex shrink-0 flex-col justify-start overflow-visible px-0.5 pt-0.5 max-[899px]:hidden min-[900px]:flex"
    >
      <div class="flex w-full min-w-0 justify-center pb-1">
        <div class="flex max-w-full flex-wrap justify-center gap-1.5 min-[900px]:gap-x-2 min-[900px]:gap-y-1.5">
          <span
            v-for="(tag, i) in displayTags"
            :key="i"
            class="inline-flex max-w-full shrink break-words rounded-full border border-white/90 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium leading-snug text-white min-[900px]:max-w-[min(100%,10rem)]"
          >
            {{ tag }}
          </span>
          <span
            v-if="extraTagCount > 0"
            class="inline-flex shrink-0 rounded-full border border-white/50 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/90"
          >
            +{{ extraTagCount }}
          </span>
          <span
            v-if="displayTags.length === 0 && extraTagCount === 0"
            class="w-full text-center text-xs text-white/50"
          >
            暂无标签
          </span>
        </div>
      </div>
    </div>

    <!-- 移动端：底部贴底，自上而下为「前往」—分隔线—收藏/下载；Web：标签下前往再统计 -->
    <div
      class="flex min-h-0 shrink-0 flex-col max-[899px]:min-h-0 max-[899px]:flex-1 max-[899px]:justify-end max-[899px]:gap-2"
    >
      <!-- 前往 -->
      <div class="flex shrink-0 justify-center min-[900px]:mt-3">
        <RouterLink
          :to="detailTo"
          class="inline-flex items-center gap-1.5 rounded-full border-2 border-white/95 bg-white/10 px-5 py-2 text-xs font-bold text-white transition hover:bg-white/20 max-[899px]:gap-1.5 max-[899px]:border max-[899px]:px-4 max-[899px]:py-1.5 max-[899px]:text-xs max-[899px]:font-semibold min-[900px]:px-5 min-[900px]:py-1.5 min-[900px]:text-[13px]"
          @click.stop="primeDetailCache"
        >
          前往
          <svg
            class="h-3.5 w-3.5 max-[899px]:h-3.5 max-[899px]:w-3.5 min-[900px]:h-4 min-[900px]:w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2 .01 7Z" />
          </svg>
        </RouterLink>
      </div>

      <hr
        class="mx-auto hidden w-[90%] max-w-none border-0 border-t border-white/35 max-[899px]:block min-[900px]:hidden"
        aria-hidden="true"
      />

      <!-- 底部统计：移动端仅收藏+下载；Web 保留分辨率、大小 -->
      <div
        class="flex min-w-0 shrink-0 flex-wrap items-center border-t border-white/15 pt-3 text-[11px] font-medium leading-snug text-white/95 max-[899px]:justify-center max-[899px]:gap-6 max-[899px]:border-t-0 max-[899px]:pb-0.5 max-[899px]:pt-0 max-[899px]:text-[10px] min-[900px]:mt-3 min-[900px]:justify-around min-[900px]:gap-x-2 min-[900px]:gap-y-2"
      >
      <span class="inline-flex min-w-0 items-center gap-1.5 max-[899px]:gap-1">
        <svg
          class="h-4 w-4 shrink-0 text-white max-[899px]:h-3.5 max-[899px]:w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7L12 17.3Z"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
          />
        </svg>
        {{ formatNum(favoriteCount) }}
      </span>
      <span class="inline-flex min-w-0 items-center gap-1.5 max-[899px]:gap-1">
        <svg
          class="h-4 w-4 shrink-0 text-white max-[899px]:h-3.5 max-[899px]:w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 4v11m0 0 3.5-3.5M12 15 8.5 11.5M5 19h14"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ formatNum(downloadCount) }}
      </span>
      <span class="hidden min-w-0 items-center gap-1.5 min-[900px]:inline-flex">
        <svg class="h-4 w-4 shrink-0 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.4" />
          <path d="M8 21h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
        <span class="min-w-0 break-all tabular-nums">{{ resolution }}</span>
      </span>
      <span class="hidden min-w-0 items-center gap-1.5 min-[900px]:inline-flex">
        <svg class="h-4 w-4 shrink-0 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 4h9l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
          />
        </svg>
        <span class="min-w-0 break-words">{{ fileSizeLabel }}</span>
      </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { filterTagsForDisplay } from '../api/wallpapers'
import { ROUTE_NAME_WALLPAPER_DETAIL } from '../router'
import { cacheWallpaperForDetail } from '../utils/wallpaperDetailCache'

const props = withDefaults(
  defineProps<{
    wallpaperId: string | number
    imageUrl: string
    /** 原图下载地址（与列表项一致，供详情页下载） */
    downloadUrl?: string
    /** 详情页大图用 originalUrl */
    originalUrl?: string
    tags?: string[]
    /** 接口 classificationTag，优先展示 */
    classificationTags?: string[]
    favoriteCount?: number
    downloadCount?: number
    isFavorited?: boolean
    /** Web 端底部展示；移动端隐藏 */
    resolution?: string
    fileSizeLabel?: string
  }>(),
  {
    tags: () => [],
    classificationTags: () => [],
    favoriteCount: 0,
    downloadCount: 0,
    resolution: '—',
    fileSizeLabel: '—',
  },
)

const detailTo = computed(() => ({
  name: ROUTE_NAME_WALLPAPER_DETAIL,
  params: { id: String(props.wallpaperId) },
  query: { kind: 'pc' as const },
}))

function primeDetailCache() {
  cacheWallpaperForDetail({
    id: props.wallpaperId,
    imageUrl: props.imageUrl,
    originalUrl: props.originalUrl,
    downloadUrl: props.downloadUrl,
    tags: props.tags,
    classificationTags: props.classificationTags,
    favoriteCount: props.favoriteCount,
    downloadCount: props.downloadCount,
    isFavorited: props.isFavorited,
    resolution: props.resolution,
    fileSizeLabel: props.fileSizeLabel,
    kind: 'pc',
  })
}

const MAX_TAGS = 5

/** 显示 tags，过滤掉疑似 ID 的标签 */
const effectiveClassificationTags = computed(() => {
  return filterTagsForDisplay(props.tags ?? [])
})

const displayTags = computed(() => effectiveClassificationTags.value.slice(0, MAX_TAGS))

const extraTagCount = computed(() => Math.max(0, effectiveClassificationTags.value.length - MAX_TAGS))

function formatNum(n: number | undefined) {
  if (n == null || !Number.isFinite(n)) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(Math.round(n))
}
</script>

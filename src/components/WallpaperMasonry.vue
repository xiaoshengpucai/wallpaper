<template>
  <div
    ref="scrollRootRef"
    class="wallpaper-masonry-scroll w-full min-h-0"
    :class="[
      lightTheme ? 'text-slate-800' : 'text-white',
      pageScroll ? '' : 'overflow-y-auto overscroll-contain',
    ]"
    @scroll.passive="onContainerScroll"
  >
    <div ref="measureRef" class="relative mx-auto w-full" :class="measureWrapClass">
      <div
        class="relative w-full"
        :style="{ height: Math.max(layoutTotalHeight + sentinelGap, 1) + 'px' }"
      >
        <div
          v-for="cell in visibleCells"
          :key="String(cell.id)"
          :data-key="String(cell.id)"
          data-masonry-tile
          class="absolute box-content overflow-hidden rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.25)]"
          :style="{ willChange: 'transform, width, height, opacity' }"
          @click="onTileClick(cell)"
          @mouseenter="(e) => handleMouseEnter(cell.id, e.currentTarget as HTMLElement)"
          @mouseleave="(e) => handleMouseLeave(cell.id, e.currentTarget as HTMLElement)"
        >
          <!-- 空白占位 + 图片；尺寸由瀑布流算法按手机壁纸比例估算 -->
          <div
            class="relative h-full w-full overflow-hidden rounded-[10px] uppercase leading-[10px] text-[10px]"
            :class="lightTheme ? 'bg-slate-200/90' : 'bg-white/10'"
          >
            <div
              v-if="!cell.imageUrl"
              class="flex h-full w-full items-center justify-center text-[10px] opacity-40"
            >
              —
            </div>
            <img
              v-else
              :src="cell.imageUrl"
              :alt="cell.title ?? '壁纸'"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover"
              @load="(e) => onImgLoad(cell.id, e)"
            />
            <div
              v-if="cell.imageUrl && !loadedImages.has(String(cell.id))"
              class="absolute inset-0 rounded-[10px] bg-gradient-to-b from-slate-400/25 to-slate-600/35"
              :class="lightTheme ? 'from-slate-300/40 to-slate-400/50' : ''"
            />
            <div
              v-if="colorShiftOnHover"
              class="color-overlay pointer-events-none absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0"
            />
          </div>
        </div>

        <div
          ref="sentinelRef"
          class="pointer-events-none absolute left-0 right-0 h-12 w-full"
          :style="{ top: Math.max(layoutTotalHeight - 8, 0) + 'px' }"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
// 按需导入gsap，减少首次加载大小
import gsap from 'gsap'

import type { WallpaperItem } from '../api/wallpapers'
import { debounce } from '../utils/debounce'
import { buildMasonryLayout, type MasonryLayoutCell } from '../utils/wallpaperMasonryLayout'
import { createDebouncedWindowResize, VIEWPORT_RESIZE_DEBOUNCE_MS } from '../utils/viewportResize'

const props = withDefaults(
  defineProps<{
    items: WallpaperItem[]
    lightTheme?: boolean
    /** 为 true 且非 loading 时允许触发 load-more */
    hasMore?: boolean
    loading?: boolean
    ease?: string
    duration?: number
    stagger?: number
    animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random'
    scaleOnHover?: boolean
    hoverScale?: number
    blurToFocus?: boolean
    colorShiftOnHover?: boolean
    columnGap?: number
    /** 虚拟列表视口外多渲染的像素 */
    overscan?: number
    /**
     * 固定列数（如手机壁纸页固定列数）。不传则按视口宽度在 2/3/4 列间切换。
     */
    fixedColumns?: number
    /** 量宽内层容器类名，默认 max-w-5xl + 水平内边距 */
    measureWrapClass?: string
    /**
     * 为 true 时不使用内部滚动条，高度随内容增长，由页面（window）滚动；
     * 虚拟列表与触底加载均相对视口计算。
     */
    pageScroll?: boolean
  }>(),
  {
    lightTheme: false,
    hasMore: false,
    loading: false,
    ease: 'power3.out',
    duration: 0.6,
    stagger: 0.05,
    animateFrom: 'bottom',
    scaleOnHover: true,
    hoverScale: 0.95,
    blurToFocus: true,
    colorShiftOnHover: false,
    columnGap: 12,
    overscan: 520,
    fixedColumns: undefined,
    measureWrapClass: 'max-w-5xl px-2 sm:px-3',
    pageScroll: false,
  },
)

const emit = defineEmits<{
  'tile-click': [item: WallpaperItem]
  'load-more': []
}>()

const scrollRootRef = ref<HTMLDivElement | null>(null)
const measureRef = ref<HTMLDivElement | null>(null)
const sentinelRef = ref<HTMLDivElement | null>(null)

const contentWidth = ref(0)
const columns = ref(2)
const scrollTop = shallowRef(0)
const viewportHeight = shallowRef(0)
const loadedImages = ref<Set<string>>(new Set())
const introDoneIds = new Set<string>()
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let scrollRaf = 0
let loadMoreCooldown = false
let windowScrollCleanup: (() => void) | undefined
let measureRoLastWidth = 0

const debouncedApplyMeasureWidth = debounce(() => {
  const el = measureRef.value
  if (!el) return
  const w = el.getBoundingClientRect().width
  contentWidth.value = w
  measureRoLastWidth = Math.round(w)
  if (props.pageScroll) scheduleScrollMetrics()
}, VIEWPORT_RESIZE_DEBOUNCE_MS)

const sentinelGap = 64

function updateColumns() {
  if (typeof window === 'undefined') return
  const fixed = props.fixedColumns
  if (typeof fixed === 'number' && fixed >= 1) {
    columns.value = Math.min(8, Math.floor(fixed))
    return
  }
  if (window.matchMedia('(min-width: 1280px)').matches) columns.value = 4
  else if (window.matchMedia('(min-width: 768px)').matches) columns.value = 3
  else columns.value = 2
}

function updateScrollMetrics() {
  if (props.pageScroll) {
    const el = measureRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    scrollTop.value = -rect.top
    viewportHeight.value = window.innerHeight
  } else {
    const root = scrollRootRef.value
    if (!root) return
    scrollTop.value = root.scrollTop
    viewportHeight.value = root.clientHeight
  }
}

function scheduleScrollMetrics() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0
    updateScrollMetrics()
  })
}

function onContainerScroll() {
  if (!props.pageScroll) scheduleScrollMetrics()
}

const layout = computed(() =>
  buildMasonryLayout(props.items, columns.value, contentWidth.value, props.columnGap),
)

const grid = computed(() => layout.value.cells)
const layoutTotalHeight = computed(() => layout.value.totalHeight)

const visibleCells = computed(() => {
  const list = grid.value
  if (list.length === 0) return []
  const st = scrollTop.value
  const vh = viewportHeight.value || 800
  const os = props.overscan
  return list.filter((item) => item.y + item.h >= st - os && item.y <= st + vh + os)
})

const layoutSignature = computed(
  () =>
    `${columns.value}:${Math.round(contentWidth.value)}:${props.items.length}:${props.columnGap}`,
)

function escapeKey(id: string | number): string {
  const s = String(id)
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(s)
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function queryTileEl(id: string | number): HTMLElement | null {
  const root = measureRef.value
  if (!root) return null
  return root.querySelector(`[data-masonry-tile][data-key="${escapeKey(id)}"]`) as HTMLElement | null
}

function getInitialPosition(item: MasonryLayoutCell) {
  const containerRect = measureRef.value?.getBoundingClientRect()
  if (!containerRect) return { x: item.x, y: item.y }

  let direction = props.animateFrom
  if (props.animateFrom === 'random') {
    const dirs = ['top', 'bottom', 'left', 'right'] as const
    direction = dirs[Math.floor(Math.random() * dirs.length)]!
  }

  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  /** 与 masonry 的 item.y 同一坐标系，避免与视口高度混用导致长列表里像「从上方」划入 */
  const rise = Math.round(Math.min(260, Math.max(96, vh * 0.32)))

  switch (direction) {
    case 'top':
      return { x: item.x, y: item.y - rise }
    case 'bottom':
      return { x: item.x, y: item.y + rise }
    case 'left':
      return { x: -200, y: item.y }
    case 'right':
      return { x: window.innerWidth + 200, y: item.y }
    case 'center':
      return {
        x: containerRect.width / 2 - item.w / 2,
        y: containerRect.height / 2 - item.h / 2,
      }
    default:
      return { x: item.x, y: item.y + 100 }
  }
}

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function playIntro(el: HTMLElement, item: MasonryLayoutCell) {
  const animProps = { x: item.x, y: item.y, width: item.w, height: item.h }
  const gi = Math.max(0, grid.value.findIndex((g) => String(g.id) === String(item.id)))
  const delay = gi * props.stagger

  if (reduceMotion) {
    gsap.set(el, { opacity: 1, filter: 'none', ...animProps })
    return
  }

  const start = getInitialPosition(item)
  gsap.fromTo(
    el,
    {
      opacity: 0,
      x: start.x,
      y: start.y,
      width: item.w,
      height: item.h,
      ...(props.blurToFocus ? { filter: 'blur(10px)' } : {}),
    },
    {
      opacity: 1,
      ...animProps,
      ...(props.blurToFocus ? { filter: 'blur(0px)' } : {}),
      duration: 0.8,
      ease: 'power3.out',
      delay,
      overwrite: 'auto',
    },
  )
}

function repositionKnownTiles() {
  for (const item of visibleCells.value) {
    const sid = String(item.id)
    if (!introDoneIds.has(sid)) continue
    const el = queryTileEl(item.id)
    if (!el) continue
    gsap.to(el, {
      x: item.x,
      y: item.y,
      width: item.w,
      height: item.h,
      duration: props.duration,
      ease: props.ease,
      overwrite: 'auto',
    })
  }
}

watch(
  () => props.fixedColumns,
  () => {
    updateColumns()
  },
)

watch(layoutSignature, () => {
  nextTick(() => {
    if (props.pageScroll) scheduleScrollMetrics()
    repositionKnownTiles()
  })
})

watch(visibleCells, (now, prev) => {
  nextTick(() => {
    const prevSet = new Set((prev ?? []).map((x) => String(x.id)))
    for (const item of now) {
      const sid = String(item.id)
      if (prevSet.has(sid)) continue
      const el = queryTileEl(item.id)
      if (!el) continue
      if (!introDoneIds.has(sid)) {
        introDoneIds.add(sid)
        playIntro(el, item)
      } else {
        gsap.set(el, {
          x: item.x,
          y: item.y,
          width: item.w,
          height: item.h,
          opacity: 1,
          ...(props.blurToFocus ? { filter: 'blur(0px)' } : {}),
        })
      }
    }
  })
}, { flush: 'post' })

watch(
  () => props.items,
  (next, prev) => {
    const prevLen = prev?.length ?? 0
    if (next.length < prevLen) introDoneIds.clear()
  },
)

function handleMouseEnter(id: string | number, element: HTMLElement) {
  if (!props.scaleOnHover || reduceMotion) return
  const sel = `[data-masonry-tile][data-key="${escapeKey(id)}"]`
  gsap.to(sel, {
    scale: props.hoverScale,
    duration: 0.3,
    ease: 'power2.out',
  })
  if (props.colorShiftOnHover) {
    const overlay = element.querySelector('.color-overlay') as HTMLElement | null
    if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 })
  }
}

function handleMouseLeave(id: string | number, element: HTMLElement) {
  if (!props.scaleOnHover || reduceMotion) return
  const sel = `[data-masonry-tile][data-key="${escapeKey(id)}"]`
  gsap.to(sel, {
    scale: 1,
    duration: 0.3,
    ease: 'power2.out',
  })
  if (props.colorShiftOnHover) {
    const overlay = element.querySelector('.color-overlay') as HTMLElement | null
    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 })
  }
}

function onTileClick(item: WallpaperItem) {
  emit('tile-click', item)
}

function onImgLoad(id: string | number, ev: Event) {
  const img = ev.target as HTMLImageElement
  if (img?.naturalWidth <= 0) return
  const s = String(id)
  if (loadedImages.value.has(s)) return
  const next = new Set(loadedImages.value)
  next.add(s)
  loadedImages.value = next
}

function setupIntersection() {
  const target = sentinelRef.value
  if (!target) return
  const root = props.pageScroll ? null : scrollRootRef.value
  if (!props.pageScroll && !root) return
  intersectionObserver?.disconnect()
  const ioOpts: IntersectionObserverInit = { rootMargin: '480px 0px', threshold: 0 }
  if (props.pageScroll) ioOpts.root = null
  else if (root) ioOpts.root = root
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const hit = entries.some((e) => e.isIntersecting)
      if (!hit || !props.hasMore || props.loading || loadMoreCooldown) return
      loadMoreCooldown = true
      emit('load-more')
      window.setTimeout(() => {
        loadMoreCooldown = false
      }, 480)
    },
    ioOpts,
  )
  intersectionObserver.observe(target)
}

let mediaListeners: Array<{ m: MediaQueryList; fn: () => void }> = []

onMounted(() => {
  updateColumns()
  const useResponsiveCols = !(typeof props.fixedColumns === 'number' && props.fixedColumns >= 1)
  if (useResponsiveCols) {
    const mq1280 = window.matchMedia('(min-width: 1280px)')
    const mq768 = window.matchMedia('(min-width: 768px)')
    const onMq = () => updateColumns()
    mq1280.addEventListener('change', onMq)
    mq768.addEventListener('change', onMq)
    mediaListeners = [
      { m: mq1280, fn: onMq },
      { m: mq768, fn: onMq },
    ]
  }

  const el = measureRef.value
  if (el && typeof ResizeObserver !== 'undefined') {
    contentWidth.value = el.getBoundingClientRect().width
    measureRoLastWidth = Math.round(contentWidth.value)
    resizeObserver = new ResizeObserver(([entry]) => {
      const w = Math.round(entry?.contentRect?.width ?? 0)
      if (w === measureRoLastWidth) return
      debouncedApplyMeasureWidth()
    })
    resizeObserver.observe(el)
  }

  if (props.pageScroll) {
    const onScroll = () => scheduleScrollMetrics()
    const { onResize: onWinResize, cancel: cancelWinResize } = createDebouncedWindowResize(
      () => scheduleScrollMetrics(),
      VIEWPORT_RESIZE_DEBOUNCE_MS,
    )
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onWinResize, { passive: true })
    windowScrollCleanup = () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onWinResize)
      cancelWinResize()
    }
    scheduleScrollMetrics()
  } else {
    const sr = scrollRootRef.value
    if (sr) {
      scrollTop.value = sr.scrollTop
      viewportHeight.value = sr.clientHeight
    }
  }

  nextTick(() => setupIntersection())
})

watch([() => props.hasMore, () => props.loading, layoutTotalHeight], () => {
  nextTick(() => {
    if (props.pageScroll) scheduleScrollMetrics()
    setupIntersection()
  })
})

watch(
  () => props.pageScroll,
  () => {
    windowScrollCleanup?.()
    windowScrollCleanup = undefined
    nextTick(() => {
      if (props.pageScroll) {
        const onScroll = () => scheduleScrollMetrics()
        const { onResize: onWinResize, cancel: cancelWinResize } = createDebouncedWindowResize(
          () => scheduleScrollMetrics(),
          VIEWPORT_RESIZE_DEBOUNCE_MS,
        )
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onWinResize, { passive: true })
        windowScrollCleanup = () => {
          window.removeEventListener('scroll', onScroll)
          window.removeEventListener('resize', onWinResize)
          cancelWinResize()
        }
        scheduleScrollMetrics()
      } else {
        const sr = scrollRootRef.value
        if (sr) {
          scrollTop.value = sr.scrollTop
          viewportHeight.value = sr.clientHeight
        }
      }
      setupIntersection()
    })
  },
)

onUnmounted(() => {
  windowScrollCleanup?.()
  windowScrollCleanup = undefined
  debouncedApplyMeasureWidth.cancel()
  mediaListeners.forEach(({ m, fn }) => m.removeEventListener('change', fn))
  mediaListeners = []
  resizeObserver?.disconnect()
  resizeObserver = null
  intersectionObserver?.disconnect()
  intersectionObserver = null
  if (measureRef.value) {
    gsap.killTweensOf(measureRef.value.querySelectorAll('[data-masonry-tile]'))
  }
})

defineExpose({
  scrollToTop() {
    if (props.pageScroll) {
      const el = measureRef.value
      if (el) {
        const top = window.scrollY + el.getBoundingClientRect().top
        window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
      }
    } else {
      scrollRootRef.value?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
    }
  },
})
</script>

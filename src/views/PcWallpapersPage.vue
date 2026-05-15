<template>
  <section
    class="mx-auto w-full min-w-[1000px] max-[899px]:min-w-0 max-[899px]:max-w-[1800px] max-[899px]:px-2 max-[899px]:sm:px-4"
  >
    <!-- 主内容区：固定最小高度，避免网络异常时整页「塌陷」留白 -->
    <div
      class="relative min-h-[min(520px,70vh)] rounded-2xl"
      :class="themeLight ? 'bg-transparent' : 'bg-transparent'"
    >
      <div
        v-if="loadError"
        class="mb-4 rounded-2xl border px-4 py-3 text-sm"
        :class="themeLight ? 'border-red-200 bg-red-50 text-red-800' : 'border-red-400/40 bg-red-950/40 text-red-200'"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span>{{ loadError }}</span>
          <button
            type="button"
            class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="themeLight ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500/90 text-white hover:bg-red-500'"
            @click="retryLoad"
          >
            重试
          </button>
        </div>
      </div>

      <!-- 首次/无数据时：整页骨架 -->
      <div
        v-if="showFullSkeleton"
        class="grid grid-cols-4 gap-x-6 gap-y-8 max-[899px]:grid-cols-2 max-[899px]:gap-3 max-[899px]:gap-y-5 max-[899px]:sm:gap-4 max-[899px]:sm:gap-y-6"
        aria-hidden="true"
      >
        <div
          v-for="n in listPageSize"
          :key="'sk-' + n"
          class="wallpaper-skeleton aspect-[4/3] w-full min-w-0 rounded-2xl"
          :class="themeLight ? 'bg-slate-200/80' : 'bg-white/10'"
        />
      </div>

      <template v-else>
        <!-- 有数据时：加载下一页叠骨架层，避免白屏 -->
        <div
          v-if="showFetchOverlay"
          class="absolute inset-0 z-10 grid grid-cols-4 gap-x-6 gap-y-8 rounded-2xl max-[899px]:grid-cols-2 max-[899px]:gap-3 max-[899px]:gap-y-5 max-[899px]:sm:gap-4 max-[899px]:sm:gap-y-6"
          :class="themeLight ? 'bg-[#DBDBDB]/85 backdrop-blur-[2px]' : 'bg-[#393939]/80 backdrop-blur-[2px]'"
          aria-busy="true"
          aria-label="加载中"
        >
          <div
            v-for="n in listPageSize"
            :key="'ov-' + n"
            class="wallpaper-skeleton aspect-[4/3] w-full min-w-0 rounded-2xl"
            :class="themeLight ? 'bg-slate-200/90' : 'bg-white/15'"
          />
        </div>

        <Transition name="wallpaper-fade" mode="out-in">
          <div
            v-if="wallpapers.length > 0"
            key="wallpaper-grid"
            class="grid grid-cols-4 gap-x-6 gap-y-8 max-[899px]:grid-cols-2 max-[899px]:gap-3 max-[899px]:gap-y-5 max-[899px]:sm:gap-4 max-[899px]:sm:gap-y-6"
          >
            <div
              v-for="(item, index) in wallpapers"
              :key="`${wallpaperRevealEpoch}-${currentPage}-${item.id}`"
              class="wallpaper-tile wallpaper-card-out-in aspect-[4/3] w-full min-w-0 cursor-pointer overflow-visible rounded-2xl"
              :style="{
                '--wc-delay': wallpaperRevealDelay(index),
                '--wc-duration': `${WALLPAPER_REVEAL_DURATION_SEC}s`,
              }"
              role="link"
              tabindex="0"
              @click="goWallpaperDetail(item)"
              @keydown.enter.prevent="goWallpaperDetail(item)"
              @keydown.space.prevent="goWallpaperDetail(item)"
            >
              <TiltedCard
                :image-src="item.imageUrl"
                :alt-text="item.title ?? '壁纸'"
                :caption-text="item.title ? item.title : `壁纸 #${item.id}`"
                container-width="100%"
                container-height="100%"
                image-width="100%"
                image-height="100%"
                :rotate-amplitude="14"
                :scale-on-hover="1"
                :show-mobile-warning="false"
                :show-tooltip="true"
                :display-overlay-content="true"
                :light-theme="themeLight"
              >
                <template #overlay>
                  <WallpaperHoverOverlay
                    :wallpaper-id="item.id"
                    :image-url="item.imageUrl"
                    :original-url="item.originalUrl"
                    :download-url="item.downloadUrl"
                    :tags="item.tags ?? []"
                    :classification-tags="item.classificationTags ?? []"
                    :favorite-count="item.favoriteCount"
                    :download-count="item.downloadCount"
                    :is-favorited="item.isFavorited"
                    :resolution="item.resolution"
                    :file-size-label="item.fileSizeLabel"
                  />
                </template>
              </TiltedCard>
            </div>
          </div>
          <div
            v-else
            key="wallpaper-empty"
            class="flex min-h-[280px] flex-col items-center justify-center py-12 text-center text-sm"
            :class="themeLight ? 'text-slate-600' : 'text-slate-400'"
          >
            当前页暂无壁纸数据。
          </div>
        </Transition>
      </template>
    </div>

    <!-- 移动端：底部固定时占位，避免最后一屏内容被遮挡 -->
    <div
      v-show="dockPinned"
      class="min-[900px]:hidden w-full shrink-0"
      :style="{ height: `${dockSpacerHeight}px` }"
      aria-hidden="true"
    />

    <!-- 搜索 / 筛选 + 分页；窄屏滚动至页底时取消 fixed，随文档流贴底 -->
    <div
      ref="dockWrapRef"
      class="flex flex-col items-center gap-5 min-[900px]:mt-10 min-[900px]:gap-5 max-[899px]:gap-3"
      :class="
        dockPinned
          ? themeLight
            ? 'max-[899px]:fixed max-[899px]:inset-x-0 max-[899px]:bottom-0 max-[899px]:z-40 max-[899px]:mt-0 max-[899px]:bg-gradient-to-t max-[899px]:from-[#DBDBDB]/92 max-[899px]:from-45% max-[899px]:to-transparent max-[899px]:px-2 max-[899px]:pt-2 max-[899px]:pb-[max(0.375rem,env(safe-area-inset-bottom))]'
            : 'max-[899px]:fixed max-[899px]:inset-x-0 max-[899px]:bottom-0 max-[899px]:z-40 max-[899px]:mt-0 max-[899px]:bg-gradient-to-t max-[899px]:from-black/55 max-[899px]:from-45% max-[899px]:to-transparent max-[899px]:px-2 max-[899px]:pt-2 max-[899px]:pb-[max(0.375rem,env(safe-area-inset-bottom))]'
          : 'max-[899px]:relative max-[899px]:mt-6 max-[899px]:pb-1 max-[899px]:sm:mt-10 max-[899px]:sm:gap-4'
      "
    >
      <WallpaperSearchToolbar
        v-model="searchKeyword"
        :light-theme="themeLight"
        :filter-selections="toolbarFilterSelections"
        @search="onSearchSubmit"
        @suggest-tag="onSuggestTagPick"
        @filter="onFilterSelect"
        @clear-filter="onFilterClear"
        @visual-search="onVisualSearchPlaceholder"
      />

      <nav
        class="flex justify-center max-[899px]:w-full max-[899px]:min-w-0 max-[899px]:justify-center max-[899px]:overflow-x-auto max-[899px]:px-0 max-[899px]:py-0.5 max-[899px]:[-ms-overflow-style:none] max-[899px]:[scrollbar-width:none] max-[899px]:[&::-webkit-scrollbar]:hidden"
      >
        <div
          class="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border px-2 py-2 backdrop-blur sm:gap-2 sm:px-3 max-[899px]:min-w-min max-[899px]:max-w-full max-[899px]:gap-1 max-[899px]:px-1.5 max-[899px]:py-1.5"
          :class="themeLight ? 'border-slate-200 bg-white/60' : 'border-white/10 bg-white/5'"
        >
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full text-sm transition disabled:opacity-40 max-[899px]:h-8 max-[899px]:w-8 max-[899px]:text-xs"
            :class="themeLight ? 'text-slate-700 hover:bg-black/5' : 'text-slate-100 hover:bg-white/10'"
            :disabled="currentPage === 1 || loading"
            title="上一页"
            @click="goTo(currentPage - 1)"
          >
            ←
          </button>

          <template v-if="totalPages <= 12">
            <div class="mx-0.5 flex flex-wrap items-center justify-center gap-1 max-[899px]:mx-0 max-[899px]:gap-0.5">
              <button
                v-for="p in pageNumbers"
                :key="p"
                type="button"
                class="h-9 min-w-[2.25rem] rounded-full px-1 text-sm transition max-[899px]:h-8 max-[899px]:min-w-[2rem] max-[899px]:px-0.5 max-[899px]:text-xs"
                :class="
                  p === currentPage
                    ? themeLight
                      ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.35)]'
                      : 'bg-white text-slate-900 shadow-[0_0_14px_rgba(255,255,255,0.25)]'
                    : themeLight
                      ? 'text-slate-700 hover:bg-black/5'
                      : 'text-slate-100 hover:bg-white/10'
                "
                :disabled="loading"
                @click="goTo(p)"
              >
                {{ p }}
              </button>
            </div>
          </template>
          <template v-else>
            <div class="mx-0.5 flex flex-wrap items-center justify-center gap-1 max-[899px]:mx-0 max-[899px]:gap-0.5">
              <button
                v-for="p in compactPageStrip"
                :key="p"
                type="button"
                class="h-9 min-w-[2.25rem] rounded-full px-1 text-sm transition max-[899px]:h-8 max-[899px]:min-w-[2rem] max-[899px]:px-0.5 max-[899px]:text-xs"
                :class="
                  p === currentPage
                    ? themeLight
                      ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.35)]'
                      : 'bg-white text-slate-900 shadow-[0_0_14px_rgba(255,255,255,0.25)]'
                    : themeLight
                      ? 'text-slate-700 hover:bg-black/5'
                      : 'text-slate-100 hover:bg-white/10'
                "
                :disabled="loading"
                @click="goTo(p)"
              >
                {{ p }}
              </button>
              <span
                class="px-1 text-sm tabular-nums max-[899px]:px-0.5 max-[899px]:text-xs"
                :class="themeLight ? 'text-slate-500' : 'text-slate-400'"
              >
                …
              </span>
              <button
                type="button"
                class="h-9 min-w-[2.25rem] rounded-full px-1 text-sm transition max-[899px]:h-8 max-[899px]:min-w-[2rem] max-[899px]:px-0.5 max-[899px]:text-xs"
                :class="
                  currentPage === totalPages
                    ? themeLight
                      ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.35)]'
                      : 'bg-white text-slate-900 shadow-[0_0_14px_rgba(255,255,255,0.25)]'
                    : themeLight
                      ? 'text-slate-700 hover:bg-black/5'
                      : 'text-slate-100 hover:bg-white/10'
                "
                :disabled="loading"
                @click="goTo(totalPages)"
              >
                {{ totalPages }}
              </button>
            </div>
            <div class="flex items-center gap-1 pl-1 max-[899px]:gap-0.5 max-[899px]:pl-0.5">
              <input
                v-model="jumpPageInput"
                type="text"
                inputmode="numeric"
                placeholder="#"
                class="h-9 w-12 rounded-full border bg-transparent px-2 text-center text-xs outline-none max-[899px]:h-8 max-[899px]:w-10 max-[899px]:px-1 max-[899px]:text-[10px]"
                :class="themeLight ? 'border-slate-300/80 text-slate-800' : 'border-white/20 text-slate-100'"
                @keydown.enter="submitJumpPage"
              />
              <button
                type="button"
                class="h-9 rounded-full px-3 text-xs font-semibold transition max-[899px]:h-8 max-[899px]:px-2 max-[899px]:text-[10px]"
                :class="themeLight ? 'text-slate-700 hover:bg-black/5' : 'text-slate-100 hover:bg-white/10'"
                :disabled="loading"
                @click="submitJumpPage"
              >
                Go
              </button>
            </div>
          </template>

          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full text-sm transition disabled:opacity-40 max-[899px]:h-8 max-[899px]:w-8 max-[899px]:text-xs"
            :class="themeLight ? 'text-slate-700 hover:bg-black/5' : 'text-slate-100 hover:bg-white/10'"
            :disabled="currentPage === totalPages || loading"
            title="下一页"
            @click="goTo(currentPage + 1)"
          >
            →
          </button>
        </div>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'

import {
  DEFAULT_WALLPAPER_PAGE_SIZE,
  DEFAULT_WALLPAPER_SORT,
  fetchWallpapersPage,
  type WallpaperItem,
  type WallpaperSuggestTagItem,
} from '../api/wallpapers'
import { debounce } from '../utils/debounce'
import { createDebouncedWindowResize, VIEWPORT_RESIZE_DEBOUNCE_MS } from '../utils/viewportResize'
import TiltedCard from '../components/TiltedCard.vue'
import WallpaperHoverOverlay from '../components/WallpaperHoverOverlay.vue'
import WallpaperSearchToolbar from '../components/WallpaperSearchToolbar.vue'
import { ROUTE_NAME_WALLPAPER_DETAIL } from '../router'
import { cacheWallpaperForDetail } from '../utils/wallpaperDetailCache'

const router = useRouter()
const route = useRoute()
const appThemeLight = inject<Ref<boolean> | undefined>('appThemeLight', undefined)
const themeLight = computed(() => appThemeLight?.value === true)

function goWallpaperDetail(item: WallpaperItem) {
  cacheWallpaperForDetail({ ...item, kind: 'pc' })
  router.push({
    name: ROUTE_NAME_WALLPAPER_DETAIL,
    params: { id: String(item.id) },
    query: { kind: 'pc' },
  })
}

const listPageSize = ref(DEFAULT_WALLPAPER_PAGE_SIZE)

/** 每次接口/缓存写入列表后递增，配合 :key 让每张卡重新挂载，独立重播入场动画 */
const wallpaperRevealEpoch = ref(0)

/** 与当前响应式列数对齐（2 / 3 / 4），供入场 animation-delay */
const revealGridCols = ref(2)
let revealMqCleanup: Array<() => void> = []

function updateRevealGridCols() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(min-width: 900px)').matches) {
    revealGridCols.value = 4
    return
  }
  revealGridCols.value = 2
}
/** 略密错开 + 略长单卡时长，让相邻卡动画更多重叠，观感更「连成一股」 */
const WALLPAPER_REVEAL_STAGGER_ROW_SEC = 0.085
const WALLPAPER_REVEAL_STAGGER_COL_SEC = 0.055
const WALLPAPER_REVEAL_STAGGER_MAX_SEC = 1.2
const WALLPAPER_REVEAL_DURATION_SEC = 0.78

function bumpWallpaperRevealEpoch() {
  wallpaperRevealEpoch.value += 1
}

/** 返回如 `0.14s`，供 CSS animation-delay — 每块独立计时 */
function wallpaperRevealDelay(index: number): string {
  const c = revealGridCols.value
  const col = index % c
  const row = Math.floor(index / c)
  const sec = Math.min(
    row * WALLPAPER_REVEAL_STAGGER_ROW_SEC + col * WALLPAPER_REVEAL_STAGGER_COL_SEC,
    WALLPAPER_REVEAL_STAGGER_MAX_SEC,
  )
  return `${sec}s`
}

/** 列表排序，与接口 sort 一致 */
const listSort = ref(DEFAULT_WALLPAPER_SORT)
/** 已访问页缓存上限（LRU 淘汰最久未使用的页） */
const MAX_CACHED_PAGES = 10

function readPageFromRouteQuery(raw: LocationQueryValue | LocationQueryValue[] | undefined | null): number {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v == null || v === '') return 1
  const n = parseInt(String(v), 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

/** 与地址栏同步，便于从详情返回时仍停留在原分页 */
function syncListPageToUrl(page: number) {
  const cur = readPageFromRouteQuery(route.query.page)
  if (cur === page) return
  const q = { ...route.query }
  if (page <= 1) delete q.page
  else q.page = String(page)
  void router.replace({ path: route.path, query: q })
}

const currentPage = ref(readPageFromRouteQuery(route.query.page))
/** 最后一次成功对齐的页码（失败时回退，避免页码与内容不一致） */
const lastSuccessfulPage = ref(1)
/** 失败时用户想去的页，用于重试 */
const failedTargetPage = ref<number | null>(null)

const total = ref(0)
const wallpapers = ref<WallpaperItem[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const skipPageWatch = ref(false)

const pageCache = new Map<string, { items: WallpaperItem[]; total: number }>()
let loadSeq = 0

const searchKeyword = ref('')
/** 与 Mongo 文档字段对应；点筛选按钮写入，不覆盖搜索框 */
const listStructuredFilters = reactive({
  hotLabel: '',
  wallpaperKind: '',
  classificationTag: '',
  resolutionLabel: '',
  colorTone: '',
  resolution: '',
})

/** 供筛选胶囊展示：已选值 / 清除联动 */
const toolbarFilterSelections = computed(() => ({
  hot: listStructuredFilters.hotLabel,
  kind: listStructuredFilters.wallpaperKind,
  category: listStructuredFilters.classificationTag,
  resolution: listStructuredFilters.resolution || listStructuredFilters.resolutionLabel,
  color: listStructuredFilters.colorTone,
}))
const jumpPageInput = ref('')

/** 移动端：搜索+分页条是否吸底（滑到文档最底部时关闭 fixed，避免挡页脚） */
const dockWrapRef = ref<HTMLElement | null>(null)
const dockPinned = ref(false)
const dockSpacerHeight = ref(0)
let dockResizeObserver: ResizeObserver | null = null

function isMobileDockViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 899px)').matches
}

function updateDockPinned() {
  if (typeof window === 'undefined') return
  if (!isMobileDockViewport()) {
    dockPinned.value = false
    return
  }
  const root = document.documentElement
  const slackPx = 56
  const y = window.scrollY + window.innerHeight
  dockPinned.value = y < root.scrollHeight - slackPx
}
/** 从下拉同步关键词时跳过防抖，避免与 onFilterSelect 内立即 load 重复请求 */
const skipSearchDebounce = ref(0)

const { onResize: debouncedDockResize, cancel: cancelDebouncedDockResize } = createDebouncedWindowResize(
  updateDockPinned,
  VIEWPORT_RESIZE_DEBOUNCE_MS,
)

const debouncedDockSpacerMeasure = debounce(() => {
  if (dockWrapRef.value) dockSpacerHeight.value = dockWrapRef.value.offsetHeight
}, VIEWPORT_RESIZE_DEBOUNCE_MS)

const debouncedTagSearch = debounce(() => {
  pageCache.clear()
  if (currentPage.value === 1) void load()
  else currentPage.value = 1
}, 1000)

watch(searchKeyword, () => {
  if (skipSearchDebounce.value > 0) {
    skipSearchDebounce.value -= 1
    return
  }
  debouncedTagSearch()
})

onMounted(() => {
  updateRevealGridCols()
  const mq900 = window.matchMedia('(min-width: 900px)')
  const onMq = () => {
    updateRevealGridCols()
    updateDockPinned()
  }
  mq900.addEventListener('change', onMq)
  revealMqCleanup = [() => mq900.removeEventListener('change', onMq)]

  updateDockPinned()
  window.addEventListener('scroll', updateDockPinned, { passive: true })
  window.addEventListener('resize', debouncedDockResize, { passive: true })
  revealMqCleanup.push(
    () => window.removeEventListener('scroll', updateDockPinned),
    () => window.removeEventListener('resize', debouncedDockResize),
    () => cancelDebouncedDockResize(),
  )

  void nextTick(() => {
    const el = dockWrapRef.value
    if (!el || typeof ResizeObserver === 'undefined') return
    dockResizeObserver = new ResizeObserver(() => {
      debouncedDockSpacerMeasure()
    })
    dockResizeObserver.observe(el)
    dockSpacerHeight.value = el.offsetHeight
  })
})

onBeforeUnmount(() => {
  debouncedTagSearch.cancel()
  debouncedDockSpacerMeasure.cancel()
  cancelDebouncedDockResize()
  revealMqCleanup.forEach((fn) => fn())
  revealMqCleanup = []
  dockResizeObserver?.disconnect()
  dockResizeObserver = null
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / listPageSize.value)))
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))

watch([() => wallpapers.value.length, () => loading.value, totalPages], () => {
  void nextTick(() => updateDockPinned())
})

/** 总页数较多时：前 7 页 + … + 末页（与参考图一致） */
const compactPageStrip = computed(() => {
  const tp = totalPages.value
  const n = Math.min(7, tp)
  return Array.from({ length: n }, (_, i) => i + 1)
})

const showFullSkeleton = computed(() => loading.value && wallpapers.value.length === 0)
const showFetchOverlay = computed(() => loading.value && wallpapers.value.length > 0)

function revertToSuccessfulPage() {
  skipPageWatch.value = true
  currentPage.value = lastSuccessfulPage.value
  skipPageWatch.value = false
  syncListPageToUrl(lastSuccessfulPage.value)
}

function cacheKey(page: number): string {
  const tag = searchKeyword.value.trim()
  return JSON.stringify({
    page,
    tag,
    sort: listSort.value,
    pageSize: listPageSize.value,
    f: {
      hotLabel: listStructuredFilters.hotLabel,
      wallpaperKind: listStructuredFilters.wallpaperKind,
      classificationTag: listStructuredFilters.classificationTag,
      resolutionLabel: listStructuredFilters.resolutionLabel,
      colorTone: listStructuredFilters.colorTone,
      resolution: listStructuredFilters.resolution,
    },
  })
}

function touchCache(page: number): boolean {
  const key = cacheKey(page)
  const hit = pageCache.get(key)
  if (!hit) return false
  pageCache.delete(key)
  pageCache.set(key, hit)
  wallpapers.value = hit.items
  total.value = hit.total
  lastSuccessfulPage.value = page
  failedTargetPage.value = null
  loadError.value = null
  bumpWallpaperRevealEpoch()
  return true
}

function putCache(page: number, items: WallpaperItem[], t: number) {
  const key = cacheKey(page)
  const payload = { items, total: t }
  if (pageCache.has(key)) pageCache.delete(key)
  pageCache.set(key, payload)
  while (pageCache.size > MAX_CACHED_PAGES) {
    const oldest = pageCache.keys().next().value as string | undefined
    if (oldest === undefined) break
    pageCache.delete(oldest)
  }
}

/** 与接口 `classificationTag` 对齐：去掉 `|` 两侧空格 */
function normalizeClassificationTagForApi(s: string): string {
  return s.replace(/\s*\|\s*/g, '|').trim()
}

function buildFetchQuery(page: number) {
  const tag = searchKeyword.value.trim()
  const f = listStructuredFilters
  return {
    page,
    pageSize: listPageSize.value,
    sort: listSort.value,
    ...(tag ? { tag } : {}),
    ...(f.hotLabel ? { hotLabel: f.hotLabel } : {}),
    ...(f.wallpaperKind ? { wallpaperKind: f.wallpaperKind } : {}),
    ...(f.classificationTag ? { classificationTag: normalizeClassificationTagForApi(f.classificationTag) } : {}),
    ...(f.resolutionLabel ? { resolutionLabel: f.resolutionLabel.trim() } : {}),
    ...(f.colorTone ? { colorTone: f.colorTone.trim() } : {}),
    ...(f.resolution ? { resolution: f.resolution.trim() } : {}),
  }
}

async function load() {
  const seq = ++loadSeq
  const requested = currentPage.value

  if (touchCache(requested)) {
    loading.value = false
    return
  }

  loading.value = true
  loadError.value = null
  failedTargetPage.value = null
  try {
    let { items, total: t } = await fetchWallpapersPage(buildFetchQuery(requested))
    if (seq !== loadSeq) return

    const tp = Math.max(1, Math.ceil(t / listPageSize.value))
    let cachePage = requested

    if (requested > tp) {
      skipPageWatch.value = true
      try {
        currentPage.value = tp
        const second = await fetchWallpapersPage(buildFetchQuery(tp))
        if (seq !== loadSeq) return
        items = second.items
        t = second.total
        cachePage = tp
      } finally {
        skipPageWatch.value = false
        syncListPageToUrl(currentPage.value)
      }
    }

    if (seq !== loadSeq) return

    /** 接口返回后一次性替换列表，避免分块写入 + key 变更导致「已显示又渐显」 */
    wallpapers.value = items
    total.value = t
    lastSuccessfulPage.value = cachePage
    putCache(cachePage, items, t)
    bumpWallpaperRevealEpoch()
  } catch (e) {
    if (seq !== loadSeq) return
    const msg = e instanceof Error ? e.message : '加载失败'
    loadError.value = msg
    failedTargetPage.value = requested
    revertToSuccessfulPage()
  } finally {
    if (seq === loadSeq) loading.value = false
  }
}

function retryLoad() {
  loadError.value = null
  const target = failedTargetPage.value
  failedTargetPage.value = null
  if (target != null) {
    if (target !== currentPage.value) {
      currentPage.value = target
      return
    }
  }
  void load()
}

function goTo(page: number) {
  const next = Math.min(totalPages.value, Math.max(1, page))
  if (next === currentPage.value) return
  currentPage.value = next
}

function submitJumpPage() {
  const n = parseInt(String(jumpPageInput.value).trim(), 10)
  if (!Number.isFinite(n)) return
  goTo(n)
  jumpPageInput.value = ''
}

function onSearchSubmit(kw?: string) {
  if (kw !== undefined) searchKeyword.value = kw
  listPageSize.value = DEFAULT_WALLPAPER_PAGE_SIZE
  debouncedTagSearch.cancel()
  pageCache.clear()
  if (currentPage.value === 1) void load()
  else currentPage.value = 1
}

function onSuggestTagPick(payload: Pick<WallpaperSuggestTagItem, 'tag' | 'listPath' | 'listQuery'>) {
  debouncedTagSearch.cancel()
  pageCache.clear()
  skipSearchDebounce.value += 1
  const lq = payload.listQuery
  const tagFromQuery = lq.tag?.trim()
  searchKeyword.value = (tagFromQuery && tagFromQuery.length > 0 ? tagFromQuery : payload.tag).trim()
  const sortStr = lq.sort != null ? String(lq.sort).trim() : ''
  if (sortStr) listSort.value = sortStr
  const ps = lq.pageSize
  if (typeof ps === 'number' && Number.isFinite(ps) && ps >= 1) {
    listPageSize.value = Math.min(100, Math.floor(ps))
  } else {
    listPageSize.value = DEFAULT_WALLPAPER_PAGE_SIZE
  }
  const pg = lq.page
  const nextPage = typeof pg === 'number' && Number.isFinite(pg) && pg >= 1 ? Math.floor(pg) : 1
  skipPageWatch.value = true
  currentPage.value = nextPage
  skipPageWatch.value = false
  syncListPageToUrl(nextPage)
  void load()
}

function onFilterClear(id: string) {
  listPageSize.value = DEFAULT_WALLPAPER_PAGE_SIZE
  debouncedTagSearch.cancel()
  if (id === 'hot') {
    listStructuredFilters.hotLabel = ''
    listSort.value = DEFAULT_WALLPAPER_SORT
  } else if (id === 'kind') {
    listStructuredFilters.wallpaperKind = ''
  } else if (id === 'category') {
    listStructuredFilters.classificationTag = ''
  } else if (id === 'resolution') {
    listStructuredFilters.resolutionLabel = ''
    listStructuredFilters.resolution = ''
  } else if (id === 'color') {
    listStructuredFilters.colorTone = ''
  }
  pageCache.clear()
  if (currentPage.value === 1) void load()
  else currentPage.value = 1
}

function onFilterSelect(payload: { id: string; value: string }) {
  listPageSize.value = DEFAULT_WALLPAPER_PAGE_SIZE
  debouncedTagSearch.cancel()
  const v = payload.value.trim()

  if (payload.id === 'hot') {
    const sortByLabel: Record<string, string> = {
      最新: '-createdAt',
      推荐的: '-score',
      昨日热门: '-hotYesterday',
      近三天热门: '-hot3d',
      上周热门: '-hotWeek',
      上月热门: '-hotMonth',
      近3月热门: '-hot3m',
    }
    listSort.value = sortByLabel[v] ?? DEFAULT_WALLPAPER_SORT
    listStructuredFilters.hotLabel = v
  } else if (payload.id === 'kind') {
    listStructuredFilters.wallpaperKind = v
  } else if (payload.id === 'category') {
    listStructuredFilters.classificationTag = v
  } else if (payload.id === 'resolution') {
    const compact = v.replace(/×/gi, 'x').replace(/\s+/g, '')
    if (/^\d+x\d+$/i.test(compact)) {
      listStructuredFilters.resolution = compact.toLowerCase()
      listStructuredFilters.resolutionLabel = ''
    } else {
      listStructuredFilters.resolutionLabel = v
      listStructuredFilters.resolution = ''
    }
  } else if (payload.id === 'color') {
    listStructuredFilters.colorTone = v
  }

  pageCache.clear()
  if (currentPage.value === 1) void load()
  else currentPage.value = 1
}

function onVisualSearchPlaceholder() {
  /* 以图搜图占位 */
}

watch(
  currentPage,
  (page) => {
    if (skipPageWatch.value) return
    syncListPageToUrl(page)
    void load()
  },
  { immediate: true },
)

watch(
  () => route.query.page,
  () => {
    const n = readPageFromRouteQuery(route.query.page)
    if (n === currentPage.value) return
    skipPageWatch.value = true
    currentPage.value = n
    skipPageWatch.value = false
    void load()
  },
)
</script>

<style scoped>
.wallpaper-skeleton {
  animation: wallpaper-shimmer 1.2s ease-in-out infinite;
  background-size: 200% 100%;
}

@keyframes wallpaper-shimmer {
  0% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.55;
  }
}

/* 长列表友好：离屏卡片跳过绘制，减轻滚动/布局成本（每页 16 条仍有收益） */
.wallpaper-tile {
  content-visibility: auto;
  contain-intrinsic-size: 240px 180px;
}

/**
 * 单卡独立：仅用 transform + opacity（避免多卡同时 filter:blur 掉帧）；
 * 自下方向上渐入，缓动偏「长尾」。
 */
.wallpaper-card-out-in {
  opacity: 0;
  transform: translate3d(0, 42px, 0) scale(0.98);
  will-change: transform, opacity;
  animation: wallpaper-card-out-in var(--wc-duration, 0.78s) cubic-bezier(0.16, 1, 0.32, 1) both;
  animation-delay: var(--wc-delay, 0s);
}

@keyframes wallpaper-card-out-in {
  0% {
    opacity: 0;
    transform: translate3d(0, 42px, 0) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wallpaper-card-out-in {
    animation: none;
    opacity: 1;
    transform: none;
    will-change: auto;
  }
}

.wallpaper-fade-enter-active,
.wallpaper-fade-leave-active {
  transition: opacity 0.38s ease;
}

.wallpaper-fade-enter-from,
.wallpaper-fade-leave-to {
  opacity: 0;
}
</style>

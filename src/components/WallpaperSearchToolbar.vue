<template>
  <div class="flex w-full flex-col items-center gap-1.5 px-1 min-[900px]:gap-3 min-[900px]:px-2">
    <div
      class="flex w-full max-w-[min(960px,100%)] min-[900px]:flex-row min-[900px]:flex-wrap min-[900px]:items-center min-[900px]:justify-center min-[900px]:gap-2 min-[900px]:flex-nowrap"
      :class="
        expanded
          ? 'max-[899px]:flex-col max-[899px]:items-stretch max-[899px]:gap-1.5'
          : 'max-[899px]:flex-row max-[899px]:items-center max-[899px]:gap-1.5'
      "
    >
      <!-- 移动端：始终为真实 flex 子项（避免 contents 导致 order 失效）；展开时整块玻璃卡 + 入场动画 -->
      <div
        class="flex min-w-0 flex-col min-[900px]:contents min-[900px]:gap-2.5 max-[899px]:flex max-[899px]:min-w-0 max-[899px]:flex-col"
        :class="[
          expanded
            ? 'max-[899px]:order-2 max-[899px]:w-full max-[899px]:gap-1.5  max-[899px]:rounded-xl max-[899px]:border max-[899px]:p-2 max-[899px]:shadow-[0_8px_28px_rgba(0,0,0,0.24)] max-[899px]:backdrop-blur-xl mob-expand-shell'
            : 'max-[899px]:order-1 max-[899px]:flex-1',
          expanded && isLight
            ? 'max-[899px]:border-slate-300/50 max-[899px]:bg-white/48'
            : expanded
              ? 'max-[899px]:border-white/12 max-[899px]:bg-black/36'
              : '',
        ]"
      >
        <!-- 主搜索区：联想浮层 + 胶囊；桌面未展开时宽约 500px，点击后过渡至当前行满宽 -->
        <div
          class="relative min-w-0 w-full max-[899px]:max-w-none min-[900px]:flex-1 min-[900px]:transition-[max-width] min-[900px]:duration-300 min-[900px]:ease-out"
          :class="
            expanded
              ? 'min-[900px]:max-w-[min(960px,100%)]'
              : 'min-[900px]:max-w-[500px] min-[900px]:cursor-pointer'
          "
          @click="onDesktopSearchAreaClick"
        >
        <!-- 点击/聚焦且有关键词时：上方玻璃联想列表 -->
        <Transition name="suggest-pop">
          <div
            v-show="showSuggestionPanel"
            class="absolute bottom-full left-0 right-0 z-30 mb-2 px-0.5"
            role="listbox"
            :aria-label="'搜索联想'"
          >
            <div
              class="scrollbar-none max-h-[min(280px,42vh)] overflow-y-auto overscroll-contain rounded-2xl border py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
              :class="
                isLight
                  ? 'border-slate-200/80 bg-white/70 backdrop-blur-xl'
                  : 'border-white/12 bg-black/40 backdrop-blur-xl backdrop-saturate-150'
              "
              :aria-busy="suggestLoading"
            >
              <div
                v-if="suggestLoading"
                class="flex items-center gap-2 px-4 py-2 text-xs"
                :class="isLight ? 'text-slate-500' : 'text-white/60'"
                role="status"
              >
                <span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                联想加载中…
              </div>
              <button
                v-for="(row, idx) in suggestionRows"
                :key="row.item.tag + '-' + idx"
                type="button"
                role="option"
                class="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition"
                :class="
                  isLight
                    ? 'text-slate-800 hover:bg-slate-900/10'
                    : 'text-white hover:bg-white/15'
                "
                @mousedown.prevent="pickSuggestion(row)"
              >
                <span class="min-w-0 truncate">{{ row.item.tag }}</span>
                <span
                  v-if="row.item.count > 0"
                  class="shrink-0 tabular-nums text-xs opacity-70"
                  :class="isLight ? 'text-slate-500' : 'text-white/55'"
                >
                  {{ row.item.count }}
                </span>
              </button>
            </div>
          </div>
        </Transition>

        <div
          class="search-pill-shell flex min-h-[36px] min-w-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 shadow-[0_6px_24px_rgba(0,0,0,0.22)] min-[900px]:min-h-0 min-[900px]:gap-1.5 min-[900px]:px-2 min-[900px]:py-1.5 min-[900px]:shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
          :class="[
            isLight
              ? 'border-slate-300/50 bg-white/55 backdrop-blur-xl'
              : 'border-white/12 bg-black/35 backdrop-blur-xl',
            expanded ? 'max-[899px]:transition-[transform,box-shadow] max-[899px]:duration-300 max-[899px]:ease-out' : '',
          ]"
        >
          <input
            ref="searchInputRef"
            v-model="keyword"
            type="text"
            role="searchbox"
            enterkeyhint="search"
            autocomplete="off"
            :placeholder="placeholder"
            class="min-w-0 flex-1 rounded-full border-0 bg-transparent py-1 pl-2 pr-0.5 text-[12px] outline-none ring-0 placeholder:opacity-60 min-[900px]:py-2 min-[900px]:pl-3 min-[900px]:pr-1 min-[900px]:text-sm"
            :class="isLight ? 'text-slate-800 placeholder:text-slate-500' : 'text-white placeholder:text-slate-400'"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
            @keydown.enter="emitSearch"
          />

          <button
            v-if="keyword.trim().length > 0"
            type="button"
            class="grid h-6 w-6 shrink-0 place-items-center rounded-full transition hover:bg-black/10 min-[900px]:h-8 min-[900px]:w-8"
            :class="isLight ? 'text-slate-600' : 'text-white/80 hover:bg-white/10'"
            title="清除"
            aria-label="清除搜索"
            @mousedown.prevent="clearKeyword"
          >
            <svg class="h-3 w-3 min-[900px]:h-4 min-[900px]:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
            </svg>
          </button>

          <template v-if="expanded">
            <div class="hidden h-6 w-px shrink-0 min-[900px]:block" :class="isLight ? 'bg-slate-300/60' : 'bg-white/15'" />

            <!-- 桌面：筛选项在胶囊内 -->
            <div class="hidden min-[900px]:contents max-[899px]:hidden">
              <FilterDropdown
                v-for="item in filterDefs"
                :key="'desk-' + item.id"
                :light-theme="isLight"
                :label="item.label"
                :icon="item.icon"
                :options="item.options"
                :extra="item.extra"
                :selected-value="filterSelections[item.id] ?? ''"
                @select="(opt) => onFilterSelect(item.id, opt)"
                @clear="emit('clear-filter', item.id)"
              />
            </div>

            <button
              type="button"
              class="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-dashed transition hover:brightness-125 min-[900px]:h-9 min-[900px]:w-9 min-[900px]:rounded-xl"
              :class="isLight ? 'border-slate-400/70 text-slate-700' : 'border-white/50 text-white'"
              title="以图搜图（占位）"
              @click="$emit('visualSearch')"
            >
              <svg class="h-3 w-3 min-[900px]:h-4 min-[900px]:w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.3" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.3" />
              </svg>
            </button>
          </template>

          <!-- 移动端收起：胶囊内保留以图搜图，展开入口在右侧独立按钮 -->
          <button
            v-if="!expanded"
            type="button"
            class="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-dashed transition hover:brightness-125 min-[900px]:hidden"
            :class="isLight ? 'border-slate-400/70 text-slate-700' : 'border-white/50 text-white'"
            title="以图搜图（占位）"
            @click.stop="$emit('visualSearch')"
          >
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.3" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.3" />
            </svg>
          </button>
        </div>
      </div>

        <!-- 移动端展开：筛选在搜索栏下方（带过渡） -->
        <Transition name="mob-filter-row">
          <div
            v-if="expanded"
            class="flex w-full flex-wrap items-center justify-center gap-0.5 pt-0.5 min-[900px]:hidden"
          >
            <FilterDropdown
              v-for="item in filterDefs"
              :key="'mob-' + item.id"
              :light-theme="isLight"
              :label="item.label"
              :icon="item.icon"
              :options="item.options"
              :extra="item.extra"
              :selected-value="filterSelections[item.id] ?? ''"
              @select="(opt) => onFilterSelect(item.id, opt)"
              @clear="emit('clear-filter', item.id)"
            />
          </div>
        </Transition>
      </div>

      <button
        type="button"
        class="grid h-9 w-9 shrink-0 place-items-center rounded-full border shadow-[0_0_12px_rgba(99,102,241,0.3)] transition hover:scale-105 active:scale-95 min-[900px]:order-none min-[900px]:h-11 min-[900px]:w-11 min-[900px]:shadow-[0_0_18px_rgba(99,102,241,0.35)]"
        :class="[
          isLight
            ? 'border-indigo-300/50 bg-white/80 text-indigo-800 shadow-indigo-200/50'
            : 'border-white/20 bg-white/10 text-white',
          expanded
            ? 'max-[899px]:order-1 max-[899px]:mx-auto max-[899px]:mb-0.5'
            : 'max-[899px]:order-2',
        ]"
        :title="expanded ? '收起筛选' : '展开筛选'"
        @click="expanded = !expanded"
      >
        <svg
          class="h-4 w-4 transition-transform duration-300 min-[900px]:h-5 min-[900px]:w-5"
          :class="expanded ? 'rotate-180' : ''"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M8 9V5m0 0H4m4 0 3 3m5-3v4m0-4h4m-4 0-3 3M8 15v4m0 0H4m4 0 3-3m5 3v-4m0 4h4m-4 0-3-3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'

import { fetchWallpaperSuggestTags, type WallpaperSuggestTagItem } from '../api/wallpapers'
import FilterDropdown from './WallpaperSearchFilterDropdown.vue'

const props = withDefaults(
  defineProps<{
    lightTheme?: boolean
    placeholder?: string
    modelValue?: string
    /** 各筛选 id → 当前选中展示文案（与列表页 structured filters 同步） */
    filterSelections?: Record<string, string>
  }>(),
  {
    lightTheme: false,
    placeholder: '插画、简单、动漫…',
    modelValue: '',
    filterSelections: () => ({}),
  },
)

type SuggestionRow = { kind: 'remote'; item: WallpaperSuggestTagItem }

const emit = defineEmits<{
  'update:modelValue': [v: string]
  search: [keyword: string]
  suggestTag: [payload: Pick<WallpaperSuggestTagItem, 'tag' | 'listPath' | 'listQuery'>]
  filter: [payload: { id: string; value: string }]
  'clear-filter': [id: string]
  visualSearch: []
}>()

const isLight = computed(() => props.lightTheme)

const filterSelections = computed(() => props.filterSelections ?? {})

const expanded = ref(false)
const keyword = ref(props.modelValue)
const searchFocused = ref(false)
const searchInputRef = useTemplateRef<HTMLInputElement>('searchInputRef')
let blurHideTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.modelValue,
  (v) => {
    keyword.value = v
  },
)

const filterDefs = [
  {
    id: 'hot',
    label: '昨日热门',
    icon: 'none' as const,
    options: ['最新', '推荐的', '昨日热门', '近三天热门', '上周热门', '上月热门', '近3月热门'],
  },
  {
    id: 'kind',
    label: '种类',
    icon: 'image' as const,
    options: ['静态壁纸', '动态壁纸'],
  },
  {
    id: 'category',
    label: '分类',
    icon: 'crop' as const,
    /** 文案尽量与库中 `classificationTag` 一致（如 `自然|风景`）；UI 带空格时由请求前规范化 */
    options: ['魅力|迷人', '自制|艺术', '安逸|自由', '科幻|星云', '动漫|二次元', '自然|风景', '游戏|玩具'],
  },
  {
    id: 'resolution',
    label: '分辨率',
    icon: 'monitor' as const,
    options: ['1 K', '2 K', '3 K', '4 K', '5 K', '6 K', '7 K'],
    extra: 'customResolution' as const,
  },
  {
    id: 'color',
    label: '色系',
    icon: 'grid' as const,
    options: [],
    extra: 'colorSwatches' as const,
  },
]

/** 后端标签联想（防抖） */
const remoteTagItems = ref<WallpaperSuggestTagItem[]>([])
const suggestLoading = ref(false)
let suggestDebounceTimer: ReturnType<typeof setTimeout> | undefined
let suggestAbort: AbortController | null = null
let suggestRequestGeneration = 0

const suggestionRows = computed((): SuggestionRow[] => {
  const rows: SuggestionRow[] = []
  const seen = new Set<string>()
  for (const it of remoteTagItems.value) {
    const t = it.tag.trim()
    if (!t) continue
    const k = t.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    rows.push({ kind: 'remote', item: it })
  }
  return rows
})

const showSuggestionPanel = computed(
  () =>
    searchFocused.value &&
    keyword.value.trim().length >= 1 &&
    (suggestionRows.value.length > 0 || suggestLoading.value),
)

function scheduleRemoteSuggest(raw: string) {
  if (suggestDebounceTimer) clearTimeout(suggestDebounceTimer)
  const q = raw.trim().slice(0, 50)

  // 未输入任何字符时不触发联想
  if (!q) {
    suggestAbort?.abort()
    suggestAbort = null
    remoteTagItems.value = []
    suggestLoading.value = false
    return
  }

  suggestLoading.value = true
  suggestDebounceTimer = window.setTimeout(() => {
    void runRemoteSuggest(q)
  }, 320)
}

async function runRemoteSuggest(q: string) {
  suggestAbort?.abort()
  const ac = new AbortController()
  suggestAbort = ac
  const generation = ++suggestRequestGeneration

  try {
    const { items } = await fetchWallpaperSuggestTags({
      q: q || undefined,
      limit: 30,
      signal: ac.signal,
    })
    if (generation !== suggestRequestGeneration) return
    remoteTagItems.value = items
  } catch {
    if (ac.signal.aborted) return
    if (generation !== suggestRequestGeneration) return
    remoteTagItems.value = []
  } finally {
    if (generation === suggestRequestGeneration) suggestLoading.value = false
  }
}

watch(keyword, (v) => {
  emit('update:modelValue', v)
  scheduleRemoteSuggest(v)
})

onBeforeUnmount(() => {
  if (suggestDebounceTimer) clearTimeout(suggestDebounceTimer)
  suggestAbort?.abort()
})

function onDesktopSearchAreaClick(e: MouseEvent) {
  if (typeof window === 'undefined') return
  if (!window.matchMedia('(min-width: 900px)').matches) return
  if (expanded.value) return
  const t = e.target
  if (t instanceof Element && t.closest('button')) return
  expanded.value = true
}

function onSearchFocus() {
  if (blurHideTimer) clearTimeout(blurHideTimer)
  searchFocused.value = true
  // 聚焦时只有已有输入才触发联想，空输入不展示默认词
  if (keyword.value.trim().length > 0) {
    scheduleRemoteSuggest(keyword.value)
  }
}

function onSearchBlur() {
  blurHideTimer = setTimeout(() => {
    searchFocused.value = false
  }, 180)
}

function pickSuggestion(row: SuggestionRow) {
  if (blurHideTimer) clearTimeout(blurHideTimer)
  searchFocused.value = false
  searchInputRef.value?.blur()
  const t = row.item.tag.trim()
  keyword.value = t
  emit('update:modelValue', t)
  emit('suggestTag', {
    tag: row.item.tag,
    listPath: row.item.listPath,
    listQuery: row.item.listQuery,
  })
}

function clearKeyword() {
  keyword.value = ''
  emit('update:modelValue', '')
  emit('search', '')
  searchInputRef.value?.focus()
}

function emitSearch() {
  emit('search', keyword.value.trim())
}

function onFilterSelect(id: string, value: string) {
  emit('filter', { id, value })
}
</script>

<style scoped>
.suggest-pop-enter-active,
.suggest-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.suggest-pop-enter-from,
.suggest-pop-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.suggest-pop-enter-to,
.suggest-pop-leave-from {
  transform: translateY(0);
}

/* 移动端展开：玻璃卡 + 搜索胶囊自上方轻微展开 */
@media (max-width: 899px) {
  .mob-expand-shell {
    animation: mob-expand-shell-in 0.38s cubic-bezier(0.32, 0.72, 0, 1) both;
  }

  .mob-expand-shell .search-pill-shell {
    animation: mob-search-pill-in 0.34s cubic-bezier(0.32, 0.72, 0, 1) 0.06s both;
  }
}

@keyframes mob-expand-shell-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.97);
    transform-origin: top center;
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes mob-search-pill-in {
  from {
    opacity: 0.88;
    transform: scaleY(0.9);
    transform-origin: top center;
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.mob-filter-row-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.36s cubic-bezier(0.32, 0.72, 0, 1);
}

.mob-filter-row-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.22s ease;
}

.mob-filter-row-enter-from,
.mob-filter-row-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.mob-filter-row-enter-to,
.mob-filter-row-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

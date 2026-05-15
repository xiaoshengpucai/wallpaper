<template>
  <div
    ref="rootRef"
    class="relative shrink-0"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div
      class="flex cursor-pointer items-center gap-0.5 rounded-full border font-medium transition hover:brightness-110 max-[899px]:max-w-[min(5rem,18.5vw)] max-[899px]:px-1.5 max-[899px]:py-1 max-[899px]:text-[10px] min-[900px]:max-w-[min(11rem,32vw)] min-[900px]:gap-1 min-[900px]:px-2 min-[900px]:py-1.5 min-[900px]:text-[11px] sm:max-w-[min(13rem,22vw)]"
      :class="
        isLight
          ? selected
            ? 'border-indigo-400/70 bg-indigo-50/80 text-slate-900'
            : 'border-slate-400/50 bg-white/40 text-slate-800'
          : selected
            ? 'border-white/40 bg-white/15 text-white'
            : 'border-white/25 bg-white/5 text-white'
      "
      role="group"
      :aria-label="label"
      @click="toggleOpen"
    >
      <span class="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden text-left min-[900px]:gap-1">
      <span v-if="icon === 'image'" class="shrink-0 opacity-90" aria-hidden="true">
        <svg class="h-3 w-3 min-[900px]:h-3.5 min-[900px]:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" fill="currentColor" stroke="none" />
          <path d="M21 17l-5-5-4 4-3-3-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span v-else-if="icon === 'crop'" class="shrink-0 opacity-90" aria-hidden="true">
        <svg class="h-3 w-3 min-[900px]:h-3.5 min-[900px]:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="M6 3v15h15M9 9h9v9H9V9Z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span v-else-if="icon === 'monitor'" class="shrink-0 opacity-90" aria-hidden="true">
        <svg class="h-3 w-3 min-[900px]:h-3.5 min-[900px]:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <rect x="2" y="4" width="20" height="13" rx="2" />
          <path d="M8 21h8" stroke-linecap="round" />
        </svg>
      </span>
      <span v-else-if="icon === 'grid'" class="shrink-0 opacity-90" aria-hidden="true">
        <svg class="h-3 w-3 min-[900px]:h-3.5 min-[900px]:w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="6" cy="6" r="1.6" />
          <circle cx="12" cy="6" r="1.6" />
          <circle cx="18" cy="6" r="1.6" />
          <circle cx="6" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="18" cy="12" r="1.6" />
          <circle cx="6" cy="18" r="1.6" />
          <circle cx="12" cy="18" r="1.6" />
          <circle cx="18" cy="18" r="1.6" />
        </svg>
      </span>
      <span class="min-w-0 truncate">{{ displayText }}</span>
      </span>
      <button
        v-if="selected"
        type="button"
        class="grid shrink-0 place-items-center rounded-full transition hover:bg-black/15 max-[899px]:h-4 max-[899px]:w-4 min-[900px]:h-5 min-[900px]:w-5 min-[900px]:h-6 min-[900px]:w-6"
        :class="isLight ? 'text-slate-600 hover:bg-slate-900/10' : 'text-white/90 hover:bg-white/20'"
        title="清除筛选"
        :aria-label="`清除${label}`"
        @click.stop="onClearClick"
      >
        <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <Transition name="filter-pop">
      <div
        v-show="open"
        class="absolute bottom-[calc(100%+8px)] left-1/2 z-[60] w-max min-w-[8rem] max-w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 max-[899px]:min-w-[7rem]"
      >
        <div class="absolute -bottom-2 left-0 right-0 h-2" aria-hidden="true" />

        <div
          class="scrollbar-none max-h-[min(320px,calc(100dvh-140px))] overflow-y-auto overscroll-contain rounded-2xl border px-1 py-2 shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
          :class="
            isLight
              ? 'border-slate-200/80 bg-white/55 backdrop-blur-xl'
              : 'border-white/15 bg-black/30 backdrop-blur-xl backdrop-saturate-150'
          "
        >
          <template v-if="extra === 'colorSwatches'">
            <button
              v-for="row in colorRows"
              :key="row.label"
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/15"
              :class="isLight ? 'text-slate-800 hover:bg-slate-900/5' : 'text-white'"
              @click="pick(row.label)"
            >
              <span>{{ row.label }}</span>
              <span
                class="h-4 w-4 shrink-0 rounded-full border border-white/30 shadow-inner"
                :style="{ backgroundColor: row.hex }"
              />
            </button>
          </template>

          <template v-else>
            <button
              v-for="(opt, i) in options"
              :key="i"
              type="button"
              class="block w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/15"
              :class="isLight ? 'text-slate-800 hover:bg-slate-900/5' : 'text-white'"
              @click="pick(opt)"
            >
              {{ opt }}
            </button>

            <template v-if="extra === 'customResolution'">
              <div
                class="mt-2 border-t pt-2"
                :class="isLight ? 'border-slate-200/80' : 'border-white/10'"
              >
                <p class="mb-2 px-3 text-xs opacity-80">自定义</p>
                <div class="flex items-center gap-2 px-3 pb-1">
                  <input
                    v-model="rw"
                    type="text"
                    inputmode="numeric"
                    placeholder="例: 1920"
                    class="w-full min-w-0 rounded-lg border px-2 py-1.5 text-xs outline-none"
                    :class="isLight ? 'border-slate-300 bg-white/80 text-slate-800' : 'border-white/20 bg-white/5 text-white'"
                    @keydown.enter="submitResolution"
                  />
                  <span class="shrink-0 text-xs opacity-70">×</span>
                  <input
                    v-model="rh"
                    type="text"
                    inputmode="numeric"
                    placeholder="例: 1080"
                    class="w-full min-w-0 rounded-lg border px-2 py-1.5 text-xs outline-none"
                    :class="isLight ? 'border-slate-300 bg-white/80 text-slate-800' : 'border-white/20 bg-white/5 text-white'"
                    @keydown.enter="submitResolution"
                  />
                </div>
                <p class="px-3 pb-2 pt-1 text-[10px] leading-snug opacity-60">
                  提示：可单项查询；回车触发
                </p>
              </div>
            </template>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    lightTheme?: boolean
    label: string
    icon: 'none' | 'image' | 'crop' | 'monitor' | 'grid'
    options: string[]
    extra?: 'customResolution' | 'colorSwatches'
    /** 当前已选值；有值时按钮文案显示为该值并出现清除 */
    selectedValue?: string
  }>(),
  {
    lightTheme: false,
    extra: undefined,
    selectedValue: '',
  },
)

const emit = defineEmits<{
  select: [value: string]
  clear: []
}>()

const isLight = computed(() => props.lightTheme)
const selected = computed(() => Boolean(props.selectedValue?.trim()))
const displayText = computed(() => {
  const v = props.selectedValue?.trim()
  return v && v.length > 0 ? v : props.label
})

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const rw = ref('')
const rh = ref('')

/** 桌面 hover 打开 */
function onMouseEnter() {
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches) {
    open.value = true
  }
}
function onMouseLeave() {
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches) {
    open.value = false
  }
}
/** 移动端 / 键盘 点击切换 */
function toggleOpen() {
  open.value = !open.value
}

/** 点外关闭 */
function onDocClick(e: MouseEvent) {
  if (!rootRef.value?.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick, { passive: true }))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const colorRows = [
  { label: '偏蓝', hex: '#22d3ee' },
  { label: '偏绿', hex: '#4ade80' },
  { label: '偏红', hex: '#f87171' },
  { label: '灰/白', hex: '#e2e8f0' },
  { label: '紫/粉', hex: '#c084fc' },
  { label: '暗色', hex: '#1e293b' },
  { label: '偏黄', hex: '#facc15' },
]

function pick(value: string) {
  emit('select', value)
  open.value = false
}

function onClearClick() {
  emit('clear')
  open.value = false
}

function submitResolution() {
  const w = rw.value.trim()
  const h = rh.value.trim()
  if (!w && !h) return
  emit('select', w && h ? `${w}x${h}` : w || h)
  open.value = false
}
</script>

<style scoped>
.filter-pop-enter-active,
.filter-pop-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.filter-pop-enter-from,
.filter-pop-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.filter-pop-enter-to,
.filter-pop-leave-from {
  transform: translateY(0);
}
</style>

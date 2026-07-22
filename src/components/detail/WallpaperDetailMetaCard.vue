<template>
  <div
    class="meta-glass relative flex min-w-0 flex-col overflow-hidden"
    :class="[
      narrow
        ? narrowFill
          ? 'min-h-0 w-full max-w-none'
          : 'min-h-0 w-full max-w-[500px]'
        : 'h-[650px] w-[500px]',
      themeLight ? 'meta-glass--light' : 'meta-glass--dark',
    ]"
  >
    <!-- 顶区高光（原子玻璃） -->
    <div class="pointer-events-none absolute inset-0 rounded-[inherit] opacity-90" aria-hidden="true">
      <div
        class="absolute -left-1/4 -top-1/2 h-[85%] w-[70%] rounded-full blur-3xl"
        :class="themeLight ? 'bg-white/40' : 'bg-white/[0.07]'"
      />
    </div>

    <div
      class="relative flex min-h-0 flex-1 flex-col"
      :class="narrowFill ? 'px-4 pb-4 pt-4' : 'px-6 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-7'"
    >
      <h1
        class="font-semibold leading-snug tracking-tight"
        :class="[
          narrowFill ? 'text-[13px] sm:text-[15px]' : 'text-[20px] sm:text-[19px]',
          themeLight ? 'text-slate-900' : 'text-[#E8E8EA]',
        ]"
      >
        {{ displayTitle }}
      </h1>
      

      <!-- 与参考图一致：左列 分类 / 色系 / 下载量，右列 分辨率 / 大小 / 收藏量 -->
      <div
        class="grid flex-1 grid-cols-2 content-start leading-snug"
        :class="[
          narrowFill ? 'mt-3 gap-x-2 gap-y-2 text-[12px] sm:text-[13px]' : 'mt-7 gap-x-6 gap-y-6 text-[16px] sm:gap-x-7 sm:gap-y-7',
          narrow && !narrowFill ? 'grid-cols-1 gap-y-5' : '',
        ]"
      >
        <MetaCell
          label="分类"
          :theme-light="themeLight"
          :compact="narrowFill"
        >
          <template #icon>
            <IconCrop />
          </template>
          {{ categoryLine }}
        </MetaCell>
        <MetaCell
          label="分辨率"
          :theme-light="themeLight"
          :compact="narrowFill"
        >
          <template #icon>
            <IconMonitor />
          </template>
          {{ displayWallpaper.resolution ?? '—' }}
        </MetaCell>

        <MetaCell
          label="色系"
          :theme-light="themeLight"
          :compact="narrowFill"
        >
          <template #icon>
            <IconGrid />
          </template>
          <span class="inline-flex items-center gap-1.5">
            <span
              class="inline-block shrink-0 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.12)] ring-1 ring-white/20"
              :class="[
                narrowFill ? 'h-2.5 w-2.5' : 'h-4 w-4',
                themeLight ? 'bg-slate-400 ring-slate-300' : 'bg-[#9CA3AF]',
              ]"
              aria-hidden="true"
            />
            {{ colorHint }}
          </span>
        </MetaCell>
        <MetaCell
          label="大小"
          :theme-light="themeLight"
          :compact="narrowFill"
        >
          <template #icon>
            <IconDoc />
          </template>
          {{ displayWallpaper.fileSizeLabel ?? '—' }}
        </MetaCell>

        <MetaCell
          label="下载量"
          :theme-light="themeLight"
          :compact="narrowFill"
        >
          <template #icon>
            <IconDownload />
          </template>
          {{ formatNum(displayWallpaper.downloadCount) }}
        </MetaCell>
        <MetaCell
          label="收藏量"
          :theme-light="themeLight"
          :compact="narrowFill"
        >
          <template #icon>
            <IconStar />
          </template>
          {{ formatNum(displayWallpaper.favoriteCount) }}
        </MetaCell>
      </div>

      <div
        class="mt-auto flex w-full shrink-0 flex-col"
        :class="narrowFill ? 'gap-2.5 pt-2' : 'gap-4 pt-5'"
      >
        <WallpaperDetailActionBar
          :theme-light="themeLight"
          :favorited="favorited"
          :download-pending="downloadPending"
          :favorite-pending="favoritePending"
          :download-disabled="downloadDisabled"
          :narrow="narrow && !narrowFill"
          :compact="narrowFill"
          @download="emit('download')"
          @toggle-favorite="emit('toggle-favorite')"
        />
        <div
          class="flex shrink-0 flex-col items-center border-t"
          :class="[
            narrowFill ? 'pt-2' : 'pt-5',
            themeLight ? 'border-slate-300/35' : 'border-white/10',
          ]"
        >
          <div
            class="flex items-center gap-1.5 tabular-nums"
            :class="[
              narrowFill ? 'text-[10px] sm:text-[12px]' : 'text-[15px] sm:text-[16px]',
              themeLight ? 'text-slate-600' : 'text-[#C8C8CC]',
            ]"
          >
            <IconClock
              :class="[
                narrowFill ? 'h-3 w-3' : 'h-5 w-5',
                'shrink-0 opacity-80',
                themeLight ? 'text-slate-500' : 'text-[#B0B0B5]',
              ]"
            />
            <span class="font-medium">发布时间</span>
            <span
              class="font-semibold"
              :class="themeLight ? 'text-slate-800' : 'text-[#E8E8EA]'"
            >{{ publishedAt }}</span>
          </div>
        </div>
      </div>

      <p
        v-if="!wallpaper"
        class="mt-3 rounded-2xl border px-3 py-2.5 text-[13px] leading-relaxed"
        :class="
          themeLight
            ? 'border-amber-200/70 bg-amber-50/85 text-amber-900'
            : 'border-white/15 bg-white/[0.06] text-white/75'
        "
      >
        未找到本地缓存数据（例如直接打开链接）。请从列表进入以展示完整预览与背景。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { filterTagsForDisplay, type WallpaperItem } from '../../api/wallpapers'
import type { CachedWallpaperDetail } from '../../utils/wallpaperDetailCache'
import WallpaperDetailActionBar from './WallpaperDetailActionBar.vue'

const props = defineProps<{
  themeLight: boolean
  wallpaperId: string
  wallpaper: CachedWallpaperDetail | null
  displayWallpaper: WallpaperItem
  categoryLine: string
  colorHint: string
  publishedAt: string
  narrow: boolean
  /** 窄屏与预览横排时占满右侧，不设 500px 上限 */
  narrowFill?: boolean
  favorited: boolean
  downloadPending?: boolean
  favoritePending?: boolean
  downloadDisabled?: boolean
}>()

const emit = defineEmits<{
  download: []
  'toggle-favorite': []
}>()

const displayTitle = computed(() => {
  const title = props.displayWallpaper.title?.trim()
  if (title) return title

  const tags = filterTagsForDisplay(props.displayWallpaper.tags ?? [])
  if (tags.length > 0) return tags.slice(0, 3).join('-')

  const classificationTags = (props.displayWallpaper.classificationTags ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
  if (classificationTags.length > 0) return classificationTags.slice(0, 3).join('-')

  return `壁纸 #${props.wallpaperId}`
})

function formatNum(n: number | undefined) {
  if (n == null || !Number.isFinite(n)) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(Math.round(n))
}
</script>

<script lang="ts">
import { defineComponent, h } from 'vue'

const stroke = 'currentColor'

const IconCrop = defineComponent({
  name: 'IconCrop',
  setup() {
    return () =>
      h(
        'svg',
        { class: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke, 'stroke-width': '1.5', 'aria-hidden': 'true' },
        [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M4 7V4h3M4 17v3h3M20 7V4h-3M20 17v3h-3M9 9h6v6H9V9Z' })],
      )
  },
})

const IconMonitor = defineComponent({
  name: 'IconMonitor',
  setup() {
    return () =>
      h('svg', { class: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke, 'stroke-width': '1.5', 'aria-hidden': 'true' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z' }),
        h('path', { 'stroke-linecap': 'round', d: 'M8 21h8M12 17v4' }),
      ])
  },
})

const IconGrid = defineComponent({
  name: 'IconGrid',
  setup() {
    return () =>
      h('svg', { class: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke, 'stroke-width': '1.5', 'aria-hidden': 'true' }, [
        h('path', { 'stroke-linecap': 'round', d: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z' }),
      ])
  },
})

const IconDoc = defineComponent({
  name: 'IconDoc',
  setup() {
    return () =>
      h('svg', { class: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke, 'stroke-width': '1.5', 'aria-hidden': 'true' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z' }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M14 2v6h6' }),
      ])
  },
})

const IconDownload = defineComponent({
  name: 'IconDownload',
  setup() {
    return () =>
      h('svg', { class: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke, 'stroke-width': '1.5', 'aria-hidden': 'true' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4v11m0 0-3.5-3.5M12 15l3.5-3.5M5 19h14' }),
      ])
  },
})

const IconStar = defineComponent({
  name: 'IconStar',
  setup() {
    return () =>
      h('svg', { class: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke, 'stroke-width': '1.5', 'aria-hidden': 'true' }, [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          d: 'M12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7L12 17.3Z',
        }),
      ])
  },
})

const IconClock = defineComponent({
  name: 'IconClock',
  props: { class: [String, Array, Object] },
  setup(props) {
    return () =>
      h(
        'svg',
        { class: props.class, viewBox: '0 0 24 24', fill: 'none', stroke, 'stroke-width': '1.5', 'aria-hidden': 'true' },
        [h('circle', { cx: '12', cy: '12', r: '9' }), h('path', { 'stroke-linecap': 'round', d: 'M12 7v5l3 2' })],
      )
  },
})

const labelTextClass = (themeLight: boolean) =>
  themeLight ? 'text-slate-600' : 'text-[#A8A8AE]'

const valueTextClass = (themeLight: boolean) =>
  themeLight ? 'text-slate-900' : 'text-[#E8E8EA]'

const MetaCell = defineComponent({
  name: 'MetaCell',
  props: {
    label: { type: String, required: true },
    themeLight: { type: Boolean, required: true },
    compact: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: props.compact ? 'flex min-w-0 items-center gap-1.5' : 'flex min-w-0 items-center gap-3' }, [
        h(
          'span',
          {
            class: [
              'flex shrink-0 items-center justify-center border shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_2px_rgba(0,0,0,0.2)]',
              props.compact ? 'h-7 w-7 rounded-lg' : 'h-11 w-11 rounded-2xl',
              props.themeLight
                ? 'border-slate-200/90 bg-white/60 text-slate-600'
                : 'border-white/[0.12] bg-white/[0.07] text-[#B8B8BE]',
            ],
          },
          [slots.icon?.()],
        ),
        h('div', { class: 'flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-0.5' }, [
          h(
            'span',
            {
              class: [
                'shrink-0 font-medium leading-tight',
                props.compact ? 'text-[10px]' : 'text-[14px]',
                labelTextClass(props.themeLight),
              ],
            },
            props.label,
          ),
          h(
            'span',
            {
              class: [
                'min-w-0 font-semibold leading-snug tracking-tight',
                props.compact ? 'text-[12px]' : 'text-[17px] sm:text-[18px]',
                valueTextClass(props.themeLight),
              ],
            },
            slots.default?.(),
          ),
        ]),
      ])
  },
})

export default { components: { IconCrop, IconMonitor, IconGrid, IconDoc, IconDownload, IconStar, IconClock, MetaCell } }
</script>

<style scoped>
.meta-glass {
  border-radius: 26px;
  margin-top: -2%;
}

/* 凹陷立体：内阴影压暗左上、内侧右下微高光，外侧细亮边 + 落地投影 */
.meta-glass--dark {
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(0, 0, 0, 0.22) 100%);
  background-color: rgba(30, 30, 32, 0.62);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    inset 4px 4px 14px rgba(0, 0, 0, 0.52),
    inset -3px -3px 12px rgba(255, 255, 255, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    1px 1px 0 rgba(255, 255, 255, 0.1),
    0 22px 50px rgba(0, 0, 0, 0.42);
}

.meta-glass--light {
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.55) 45%, rgba(255, 255, 255, 0.4) 100%);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  box-shadow:
    inset 3px 3px 10px rgba(15, 23, 42, 0.1),
    inset -2px -2px 10px rgba(255, 255, 255, 0.65),
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 1px 0 rgba(255, 255, 255, 0.75),
    0 18px 40px rgba(15, 23, 42, 0.12);
}
</style>

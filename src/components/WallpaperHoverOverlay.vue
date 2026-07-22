<template>
  <div
    ref="overlayRef"
    class="flex h-full w-full flex-col border border-white/25 bg-black/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_0_0_1px_rgba(255,255,255,0.06)]"
    :style="{
      borderRadius: `${overlayStyle.borderRadius}px`,
      padding: `${overlayStyle.padding}px`,
    }"
  >
    <!-- 标签区：仅 Web；不换行滚动，靠缩小字号与换行完整展示 -->
    <div
      class="flex shrink-0 flex-col justify-start overflow-visible max-[899px]:hidden min-[900px]:flex"
    >
      <div class="flex w-full min-w-0 justify-center" :style="{ paddingBottom: `${overlayStyle.gap}px` }">
        <div
          class="flex max-w-full flex-wrap justify-center"
          :style="{ gap: `${overlayStyle.gap}px` }"
        >
          <span
            v-for="(tag, i) in displayTags"
            :key="i"
            class="inline-flex max-w-full shrink break-words border border-white/90 bg-white/5 font-medium leading-snug text-white min-[900px]:max-w-[min(100%,10rem)]"
            :style="{
              borderRadius: `${overlayStyle.tagBorderRadius}px`,
              padding: `${overlayStyle.tagPaddingY}px ${overlayStyle.tagPaddingX}px`,
              fontSize: `${overlayStyle.tagFontSize}px`,
            }"
          >
            {{ tag }}
          </span>
          <span
            v-if="extraTagCount > 0"
            class="inline-flex shrink-0 border border-white/50 bg-white/10 font-medium text-white/90"
            :style="{
              borderRadius: `${overlayStyle.tagBorderRadius}px`,
              padding: `${overlayStyle.tagPaddingY}px ${overlayStyle.tagPaddingX}px`,
              fontSize: `${overlayStyle.tagFontSize}px`,
            }"
          >
            +{{ extraTagCount }}
          </span>
          <span
            v-if="displayTags.length === 0 && extraTagCount === 0"
            class="w-full text-center text-white/50"
            :style="{ fontSize: `${overlayStyle.tagFontSize}px` }"
          >
            暂无标签
          </span>
        </div>
      </div>
    </div>

    <!-- 中间填充区域：将底部内容推到最底部 -->
    <div class="flex flex-1"></div>

    <!-- 底部固定区域：统计信息 -->
    <div
      class="flex min-w-0 shrink-0 flex-wrap items-center justify-center border-t border-white/15 font-medium leading-snug text-white/95"
      :style="{
        paddingTop: `${overlayStyle.gap}px`,
        fontSize: `${overlayStyle.statFontSize}px`,
        gap: `${overlayStyle.statGap}px`,
      }"
    >
      <span
        class="inline-flex min-w-0 items-center"
        :style="{ gap: `${overlayStyle.iconGap}px` }"
      >
        <svg
          class="shrink-0"
          :class="isCollected ? 'text-amber-400' : 'text-white'"
          :style="{ width: `${overlayStyle.iconSize}px`, height: `${overlayStyle.iconSize}px` }"
          viewBox="0 0 24 24"
          :fill="isCollected ? 'currentColor' : 'none'"
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
      <span
        class="inline-flex min-w-0 items-center"
        :style="{ gap: `${overlayStyle.iconGap}px` }"
      >
        <svg
          class="shrink-0 text-white"
          :style="{ width: `${overlayStyle.iconSize}px`, height: `${overlayStyle.iconSize}px` }"
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
      <span
        class="hidden min-w-0 items-center min-[900px]:inline-flex"
        :style="{ gap: `${overlayStyle.iconGap}px` }"
      >
        <svg
          class="shrink-0 text-white"
          :style="{ width: `${overlayStyle.iconSize}px`, height: `${overlayStyle.iconSize}px` }"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="13"
            rx="2"
            stroke="currentColor"
            stroke-width="1.4"
          />
          <path
            d="M8 21h8"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
          />
        </svg>
        <span class="min-w-0 break-all tabular-nums">{{ resolution }}</span>
      </span>
      <span
        class="hidden min-w-0 items-center min-[900px]:inline-flex"
        :style="{ gap: `${overlayStyle.iconGap}px` }"
      >
        <svg
          class="shrink-0 text-white"
          :style="{ width: `${overlayStyle.iconSize}px`, height: `${overlayStyle.iconSize}px` }"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

import { filterTagsForDisplay } from "../api/wallpapers";
import { useAuthStore } from "../stores/auth";

const props = withDefaults(
  defineProps<{
    wallpaperId: string | number;
    imageUrl: string;
    tags?: string[];
    classificationTags?: string[];
    favoriteCount?: number;
    downloadCount?: number;
    isFavorited?: boolean;
    resolution?: string;
    fileSizeLabel?: string;
  }>(),
  {
    tags: () => [],
    classificationTags: () => [],
    favoriteCount: 0,
    downloadCount: 0,
    resolution: "—",
    fileSizeLabel: "—",
  },
);

const overlayRef = ref<HTMLElement | null>(null);
const containerWidth = ref(200);
const containerHeight = ref(200);

let resizeObserver: ResizeObserver | null = null;

function updateSize() {
  if (overlayRef.value) {
    containerWidth.value = overlayRef.value.offsetWidth;
    containerHeight.value = overlayRef.value.offsetHeight;
  }
}

onMounted(() => {
  updateSize();
  resizeObserver = new ResizeObserver(() => {
    updateSize();
  });
  if (overlayRef.value) {
    resizeObserver.observe(overlayRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

const minDimension = computed(() => Math.min(containerWidth.value, containerHeight.value));

const overlayStyle = computed(() => {
  const minDim = minDimension.value;
  
  return {
    borderRadius: Math.max(4, Math.min(24, minDim * 0.06)),
    padding: Math.max(4, Math.min(12, minDim * 0.05)),
    gap: Math.max(4, Math.min(8, minDim * 0.03)),
    tagBorderRadius: Math.max(4, Math.min(12, minDim * 0.04)),
    tagPaddingY: Math.max(2, Math.min(4, minDim * 0.015)),
    tagPaddingX: Math.max(4, Math.min(10, minDim * 0.035)),
    tagFontSize: Math.max(6, Math.min(12, minDim * 0.05)),
    statFontSize: Math.max(6, Math.min(12, minDim * 0.05)),
    iconSize: Math.max(10, Math.min(16, minDim * 0.06)),
    statGap: Math.max(8, Math.min(16, minDim * 0.07)),
    iconGap: Math.max(3, Math.min(6, minDim * 0.02)),
  };
});

const authStore = useAuthStore();

const isCollected = computed(() =>
  authStore.isAuthenticated
    ? authStore.isWallpaperCollected(props.wallpaperId)
    : props.isFavorited === true,
);

const MAX_TAGS = 5;

const effectiveClassificationTags = computed(() => {
  return filterTagsForDisplay(props.tags ?? []);
});

const displayTags = computed(() =>
  effectiveClassificationTags.value.slice(0, MAX_TAGS),
);

const extraTagCount = computed(() =>
  Math.max(0, effectiveClassificationTags.value.length - MAX_TAGS),
);

function formatNum(n: number | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}
</script>

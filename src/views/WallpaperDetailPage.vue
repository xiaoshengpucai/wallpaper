<template>
  <Teleport to="body">
    <div v-if="backdropVisible" class="pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden="true">
      <!-- 大于视口，避免 blur / cover 在边缘被裁成「缺角」 -->
      <div
        class="absolute left-1/2 top-1/2 min-h-[130%] min-w-[130%] -translate-x-1/2 -translate-y-1/2 bg-cover bg-center"
        :style="{ backgroundImage: backdropImage }" />
      <div class="absolute inset-0 bg-black/55" />
    </div>
  </Teleport>

  <section class="relative z-[1] w-full max-w-[100vw] px-3 pb-14 pt-3 sm:px-5 sm:pb-20 sm:pt-6">
    <!-- 桌面：左 1150×600 + 右 500×650，整体水平居中、顶部对齐 -->
    <div v-if="!isNarrowViewport" ref="stageWrapRef" class="flex w-full justify-center px-1 pt-4 sm:pt-8">
      <div class="shrink-0 overflow-visible" :style="{
        width: `${stageOuterW}px`,
        height: `${stageOuterH}px`,
      }">
        <div class="flex origin-top-left items-center" :style="{
          width: `${STAGE_W}px`,
          height: `${STAGE_H}px`,
          transform: `scale(${stageScale})`,
          gap: `${STAGE_GAP}px`,
        }">
          <div class="shrink-0" :style="{ width: `${STAGE_LEFT_W}px`, height: `${STAGE_LEFT_H}px`, marginBottom: previewKind === 'mobile' ? '100px' : '0px'}"
          >
            <WallpaperDetailLaptopPreview v-if="previewKind === 'pc'" :image-url="detailPreviewImageUrl" />
            <div v-else class="h-full w-full " >
              <WallpaperDetailPhonePreview :image-url="detailPreviewImageUrl" />
            </div>
          </div>

          <WallpaperDetailMetaCard class="shrink-0" :style="{ width: `${STAGE_RIGHT_W}px` }" :theme-light="themeLight"
            :wallpaper-id="wallpaperId" :wallpaper="wallpaper" :display-wallpaper="cardDisplayWallpaper"
            :category-line="categoryLine" :color-hint="colorHint" :published-at="publishedAt" :narrow="false"
            :favorited="liveFavorited" :download-pending="downloadPending" :favorite-pending="favoritePending"
            :download-disabled="downloadDisabled" @download="onDownload" @toggle-favorite="onToggleFavorite" />
        </div>
      </div>
    </div>

    <!-- 相似推荐区域 -->
    <div v-if="!isNarrowViewport && previewKind !== 'mobile'" class="mt-20 flex w-full justify-center px-3 sm:px-5">
      <div class="w-full max-w-[1800px]">
        <h2 class="mb-8 flex items-center justify-center gap-3 text-center text-2xl font-semibold tracking-tight"
          :class="themeLight ? 'text-slate-800' : 'text-white/90'">
          <svg class="h-7 w-7" viewBox="0 0 1289 1024" xmlns="http://www.w3.org/2000/svg"
            :style="{ fill: themeLight ? '#1e293b' : 'rgba(255, 255, 255, 0.9)' }">
            <path
              d="M1268.87 308.69l-76.116 507.479a141.993 141.993 0 0 1-97.317 115.028 136.342 136.342 0 0 1-62.008 4.55L224.784 809.04c-55.41-8.685-98.227-49.53-113.018-101.185l127.05-89.314 196.568 155.645L706.74 446.7l408.456 299.117v-401.25c0-78.885-62.577-142.827-139.755-142.827H174.457l9.481-63.032C195.543 60.733 266.881 7.22 343.225 19.167l808.645 126.67c76.306 11.947 128.68 84.84 117 162.852z"
              opacity="0.7" />
            <path
              d="M1054.933 954.9c-8.078 0-16.157-0.645-24.159-1.896l-808.72-126.671c-60.15-9.481-110.06-54.044-127.127-113.663a17.37 17.37 0 0 1 6.713-18.962l127.05-89.39a17.635 17.635 0 0 1 21.049 0.606l183.066 144.913 260.32-314.212a17.597 17.597 0 0 1 23.968-2.958l380.582 278.638V344.567c0-69.138-54.84-125.42-122.234-125.42H174.457a17.597 17.597 0 0 1-17.294-20.024l9.443-62.994a159.552 159.552 0 0 1 63.905-106.116A154.129 154.129 0 0 1 345.993 1.911l808.683 126.67c85.598 13.426 144.648 95.383 131.602 182.725l-76.193 507.518a161.183 161.183 0 0 1-37.128 81.425 157.39 157.39 0 0 1-72.172 47.597 152.84 152.84 0 0 1-45.89 7.054zM132.587 714.643c16.005 40.731 52.148 70.54 94.927 77.216l808.684 126.67a118.365 118.365 0 0 0 54.005-3.944c44.676-13.956 78.127-53.626 85.257-100.995l76.04-507.48c10.24-68.455-35.65-132.625-102.36-143.092L340.455 36.347a119.162 119.162 0 0 0-89.238 21.77 124.926 124.926 0 0 0-49.986 83.17l-6.447 42.969h780.694c86.697 0 157.277 71.907 157.277 160.31v401.251a17.635 17.635 0 0 1-27.951 14.033L709.698 470.555 448.885 785.222a17.597 17.597 0 0 1-24.462 2.579L238.21 640.27l-105.66 74.372z"
              opacity="0.5" />
            <path
              d="M975.441 1018.273H157.352C70.58 1018.273 0 946.405 0 858.001V344.605c0-88.367 70.541-160.311 157.277-160.311h818.202c86.697 0 157.277 71.906 157.277 160.31v513.397c0 88.404-70.58 160.272-157.277 160.272zM157.352 219.071c-67.355 0-122.233 56.244-122.233 125.42V858c-0.038 69.175 54.802 125.38 122.196 125.38h818.164c67.318 0 122.196-56.242 122.196-125.418V344.605c0-69.176-54.84-125.458-122.196-125.458l-818.164-0.076z"
              opacity="0.5" />
            <path
              d="M975.441 1018.273H157.352C70.58 1018.273 0 946.405 0 858.001v-83.816c0-5.688 2.769-10.998 7.395-14.222L228.69 604.318a17.635 17.635 0 0 1 21.049 0.606l183.066 144.913 260.32-314.212a17.597 17.597 0 0 1 23.968-2.958l408.533 299.118a17.408 17.408 0 0 1 7.13 14.032v112.184c0 28.785-7.585 57.077-22.11 81.956a159.666 159.666 0 0 1-56.206 56.699 155.082 155.082 0 0 1-78.961 21.617zM35.12 783.173v74.828c0 69.175 54.84 125.38 122.233 125.38h818.165c43.31 0 82.526-22.792 104.864-60.983a127.895 127.895 0 0 0 17.332-64.473V754.654l-387.977-284.1-260.813 314.668a17.597 17.597 0 0 1-24.462 2.579L238.247 640.27 35.081 783.174z" />
            <path
              d="M1115.196 745.817v112.184a144.61 144.61 0 0 1-19.721 73.196c-24.386 41.717-69.024 69.669-119.996 69.669H157.315c-77.179 0-139.756-63.943-139.756-142.865v-83.816l94.207-66.255 127.05-89.352 196.568 155.607L706.74 446.7l408.456 299.117z"
              opacity="0.7" />
            <path
              d="M975.441 1018.273H157.352C70.58 1018.273 0 946.405 0 858.001v-83.816c0-5.688 2.769-10.998 7.395-14.222L228.69 604.318a17.635 17.635 0 0 1 21.049 0.606l183.066 144.913 260.32-314.212a17.597 17.597 0 0 1 23.968-2.958l408.533 299.118a17.408 17.408 0 0 1 7.13 14.032v112.184c0 28.785-7.585 57.077-22.11 81.956a159.666 159.666 0 0 1-56.206 56.699 155.082 155.082 0 0 1-78.961 21.617zM35.12 783.173v74.828c0 69.175 54.84 125.38 122.233 125.38h818.165c43.31 0 82.526-22.792 104.864-60.983a127.895 127.895 0 0 0 17.332-64.473V754.654l-387.977-284.1-260.813 314.668a17.597 17.597 0 0 1-24.462 2.579L238.247 640.27 35.081 783.174z"
              opacity="0.5" />
            <path
              d="M146.582 378.206c0 53.475 43.614 96.824 97.468 96.824a97.127 97.127 0 0 0 97.392-96.824 96.71 96.71 0 0 0-48.734-83.89 97.923 97.923 0 0 0-97.392 0 96.71 96.71 0 0 0-48.734 83.815z"
              opacity="0.7" />
            <path
              d="M244.012 492.438A114.61 114.61 0 0 1 129.06 378.13a114.61 114.61 0 0 1 114.952-114.27 114.61 114.61 0 0 1 114.952 114.27A114.724 114.724 0 0 1 244.05 492.4z m0-193.685a79.643 79.643 0 0 0-79.87 79.415 79.643 79.643 0 0 0 79.87 79.416 79.643 79.643 0 0 0 79.87-79.453 79.757 79.757 0 0 0-79.87-79.378z"
              opacity="0.5" />
          </svg>
          <span>相似推荐</span>
        </h2>

        <!-- 推荐列表 -->
        <div v-if="recommendations.length > 0" class="wallpaper-grid-reveal grid gap-4" :class="{
          'grid-cols-2': columnCount === 2,
          'grid-cols-3': columnCount === 3,
          'grid-cols-4': columnCount === 4,
        }">
          <div v-for="(item, idx) in recommendations" :key="`rec-${recommendEpoch}-${item.id}`"
            class="wallpaper-tile aspect-[4/3] w-full min-w-0 overflow-visible rounded-2xl"
            :style="{ '--wallpaper-reveal-delay': getRevealDelay(idx) }">
            <TiltedCard :image-src="item.imageUrl" :alt-text="item.title ?? '壁纸'"
              :caption-text="item.title ? item.title : `壁纸 #${item.id}`" container-width="100%" container-height="100%"
              image-width="100%" image-height="100%" :rotate-amplitude="14" :scale-on-hover="1"
              :show-mobile-warning="false" :show-tooltip="true" :display-overlay-content="true"
              :light-theme="themeLight">
              <template #overlay>
                <WallpaperHoverOverlay :wallpaper-id="item.id" :image-url="item.imageUrl"
                  :original-url="item.originalUrl" :download-url="item.downloadUrl" :tags="item.tags ?? []"
                  :classification-tags="item.classificationTags ?? []" :favorite-count="item.favoriteCount"
                  :download-count="item.downloadCount" :is-favorited="item.isFavorited" :resolution="item.resolution"
                  :file-size-label="item.fileSizeLabel" />
              </template>
            </TiltedCard>
          </div>
        </div>

        <!-- 加载更多触发器 -->
        <div v-if="recommendations.length > 0 && !recommendLoadingAll" ref="recommendLoadMoreRef"
          class="mt-8 flex justify-center py-4">
          <div v-if="recommendLoading" class="text-sm" :class="themeLight ? 'text-slate-600' : 'text-white/60'">
            加载中...
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="recommendations.length === 0 && !recommendLoading"
          class="flex min-h-[200px] items-center justify-center text-sm"
          :class="themeLight ? 'text-slate-600' : 'text-white/60'">
          暂无推荐
        </div>
      </div>
    </div>

    <div v-if="isNarrowViewport" class="w-full pb-2 pt-2 sm:pb-4"
      :class="previewKind === 'mobile' ? 'detail-narrow-mobile-row' : 'detail-narrow-pc-row'">
      <template v-if="previewKind === 'mobile'">
        <div class="detail-mobile-preview-stage">
          <div class="detail-mobile-preview-shell box-border shrink-0">
            <div class="detail-mobile-preview-scale" :style="narrowMobilePreviewOuterStyle">
              <div class="origin-top-left" :style="narrowMobilePreviewInnerStyle">
                <WallpaperDetailPhonePreview :image-url="detailPreviewImageUrl" />
              </div>
            </div>
          </div>
        </div>
        <WallpaperDetailMetaCard class="detail-mobile-meta-card min-w-0" :theme-light="themeLight"
          :wallpaper-id="wallpaperId" :wallpaper="wallpaper" :display-wallpaper="cardDisplayWallpaper"
          :category-line="categoryLine" :color-hint="colorHint" :published-at="publishedAt" :narrow="true" narrow-fill
          :favorited="liveFavorited" :download-pending="downloadPending" :favorite-pending="favoritePending"
          :download-disabled="downloadDisabled" @download="onDownload" @toggle-favorite="onToggleFavorite" />
      </template>
      <template v-else>
        <div class="detail-pc-preview-stage">
          <div class="detail-pc-preview-scale" :style="narrowPcPreviewOuterStyle">
            <div class="origin-top-left" :style="narrowPcPreviewInnerStyle">
              <WallpaperDetailLaptopPreview :image-url="detailPreviewImageUrl" />
            </div>
          </div>
        </div>
        <WallpaperDetailMetaCard class="detail-pc-meta-card min-w-0" :theme-light="themeLight"
          :wallpaper-id="wallpaperId" :wallpaper="wallpaper" :display-wallpaper="cardDisplayWallpaper"
          :category-line="categoryLine" :color-hint="colorHint" :published-at="publishedAt" :narrow="true" narrow-fill
          :favorited="liveFavorited" :download-pending="downloadPending" :favorite-pending="favoritePending"
          :download-disabled="downloadDisabled" @download="onDownload" @toggle-favorite="onToggleFavorite" />
      </template>
    </div>

    <div v-if="previewKind === 'mobile'" class="mt-8 w-full pb-2 sm:mt-10 sm:pb-4">
      <div class="mx-auto w-full max-w-[1600px] px-0.5 pt-4 sm:px-0 sm:pt-6">
        <h2
          class="mb-8 flex items-center justify-center gap-3 text-center text-xl font-semibold tracking-tight sm:mb-6 sm:text-2xl"
          :class="themeLight ? 'text-slate-800' : 'text-white/80'">
          <svg class="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 1289 1024" xmlns="http://www.w3.org/2000/svg"
            :style="{ fill: themeLight ? '#1e293b' : 'rgba(255, 255, 255, 0.9)' }">
            <path
              d="M1268.87 308.69l-76.116 507.479a141.993 141.993 0 0 1-97.317 115.028 136.342 136.342 0 0 1-62.008 4.55L224.784 809.04c-55.41-8.685-98.227-49.53-113.018-101.185l127.05-89.314 196.568 155.645L706.74 446.7l408.456 299.117v-401.25c0-78.885-62.577-142.827-139.755-142.827H174.457l9.481-63.032C195.543 60.733 266.881 7.22 343.225 19.167l808.645 126.67c76.306 11.947 128.68 84.84 117 162.852z"
              opacity="0.7" />
            <path
              d="M1054.933 954.9c-8.078 0-16.157-0.645-24.159-1.896l-808.72-126.671c-60.15-9.481-110.06-54.044-127.127-113.663a17.37 17.37 0 0 1 6.713-18.962l127.05-89.39a17.635 17.635 0 0 1 21.049 0.606l183.066 144.913 260.32-314.212a17.597 17.597 0 0 1 23.968-2.958l380.582 278.638V344.567c0-69.138-54.84-125.42-122.234-125.42H174.457a17.597 17.597 0 0 1-17.294-20.024l9.443-62.994a159.552 159.552 0 0 1 63.905-106.116A154.129 154.129 0 0 1 345.993 1.911l808.683 126.67c85.598 13.426 144.648 95.383 131.602 182.725l-76.193 507.518a161.183 161.183 0 0 1-37.128 81.425 157.39 157.39 0 0 1-72.172 47.597 152.84 152.84 0 0 1-45.89 7.054zM132.587 714.643c16.005 40.731 52.148 70.54 94.927 77.216l808.684 126.67a118.365 118.365 0 0 0 54.005-3.944c44.676-13.956 78.127-53.626 85.257-100.995l76.04-507.48c10.24-68.455-35.65-132.625-102.36-143.092L340.455 36.347a119.162 119.162 0 0 0-89.238 21.77 124.926 124.926 0 0 0-49.986 83.17l-6.447 42.969h780.694c86.697 0 157.277 71.907 157.277 160.31v401.251a17.635 17.635 0 0 1-27.951 14.033L709.698 470.555 448.885 785.222a17.597 17.597 0 0 1-24.462 2.579L238.21 640.27l-105.66 74.372z"
              opacity="0.5" />
            <path
              d="M975.441 1018.273H157.352C70.58 1018.273 0 946.405 0 858.001V344.605c0-88.367 70.541-160.311 157.277-160.311h818.202c86.697 0 157.277 71.906 157.277 160.31v513.397c0 88.404-70.58 160.272-157.277 160.272zM157.352 219.071c-67.355 0-122.233 56.244-122.233 125.42V858c-0.038 69.175 54.802 125.38 122.196 125.38h818.164c67.318 0 122.196-56.242 122.196-125.418V344.605c0-69.176-54.84-125.458-122.196-125.458l-818.164-0.076z"
              opacity="0.5" />
            <path
              d="M975.441 1018.273H157.352C70.58 1018.273 0 946.405 0 858.001v-83.816c0-5.688 2.769-10.998 7.395-14.222L228.69 604.318a17.635 17.635 0 0 1 21.049 0.606l183.066 144.913 260.32-314.212a17.597 17.597 0 0 1 23.968-2.958l408.533 299.118a17.408 17.408 0 0 1 7.13 14.032v112.184c0 28.785-7.585 57.077-22.11 81.956a159.666 159.666 0 0 1-56.206 56.699 155.082 155.082 0 0 1-78.961 21.617zM35.12 783.173v74.828c0 69.175 54.84 125.38 122.233 125.38h818.165c43.31 0 82.526-22.792 104.864-60.983a127.895 127.895 0 0 0 17.332-64.473V754.654l-387.977-284.1-260.813 314.668a17.597 17.597 0 0 1-24.462 2.579L238.247 640.27 35.081 783.174z" />
          </svg>
          <span style="font-size: 28px;">相似推荐</span>
        </h2>

        <WallpaperMasonry v-if="recommendations.length > 0" class="w-full" measure-wrap-class="max-w-none px-0"
          page-scroll :items="recommendations" :light-theme="themeLight" :fixed-columns="mobileRecommendColumns"
          :has-more="false" :loading="recommendLoading" :duration="0.6" :stagger="0.05" animate-from="bottom"
          :scale-on-hover="true" :hover-scale="0.95" :blur-to-focus="true" :color-shift-on-hover="false"
          @tile-click="onRecommendTileClick" />

        <div v-else-if="recommendLoading" class="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4" aria-hidden="true">
          <div v-for="n in 8" :key="'rec-sk-' + n" class="aspect-[9/19] animate-pulse rounded-[10px]"
            :class="themeLight ? 'bg-slate-200/90' : 'bg-white/10'" />
        </div>

        <div v-else class="flex min-h-[200px] items-center justify-center text-sm"
          :class="themeLight ? 'text-slate-600' : 'text-white/60'">
          暂无推荐
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import WallpaperDetailLaptopPreview from '../components/detail/WallpaperDetailLaptopPreview.vue'
import WallpaperDetailMetaCard from '../components/detail/WallpaperDetailMetaCard.vue'
import WallpaperDetailPhonePreview from '../components/detail/WallpaperDetailPhonePreview.vue'
import TiltedCard from '../components/TiltedCard.vue'
import WallpaperHoverOverlay from '../components/WallpaperHoverOverlay.vue'
import WallpaperMasonry from '../components/WallpaperMasonry.vue'
import { ROUTE_NAME_WALLPAPER_DETAIL } from '../router'
import {
  fetchDetailRecommendationsPage,
  fetchWallpaperFileBlob,
  filterTagsForDisplay,
  reportWallpaperDownloaded,
  reportWallpaperFavorite,
  type WallpaperItem,
} from '../api/wallpapers'
import type { CachedWallpaperDetail, WallpaperDetailKind } from '../utils/wallpaperDetailCache'
import { debounce } from '../utils/debounce'
import { downloadImageFile, saveBlobAsDownload } from '../utils/downloadImageFile'
import { rememberWallpaperBackdropUrl } from '../utils/wallpaperBackdropMemory'
import { cacheWallpaperForDetail, readWallpaperDetailCache } from '../utils/wallpaperDetailCache'
import { createWidthOnlyDebouncedWindowResize, VIEWPORT_RESIZE_DEBOUNCE_MS } from '../utils/viewportResize'

const route = useRoute()
const router = useRouter()
const appThemeLight = inject<Ref<boolean> | undefined>('appThemeLight', undefined)
const themeLight = computed(() => appThemeLight?.value === true)

const STAGE_GAP = 400
const STAGE_LEFT_W_MOBILE = 680
const STAGE_LEFT_H_MOBILE = 800
const STAGE_LEFT_W_PC = 1150
const STAGE_LEFT_H_PC = 600
const STAGE_RIGHT_W = 520
const STAGE_RIGHT_H = 900
const PHONE_PREVIEW_W = 670
const PHONE_PREVIEW_H = 850
const LAPTOP_PREVIEW_TOTAL_W = 1250
const LAPTOP_PREVIEW_H = 600

const STAGE_LEFT_W = computed(() => previewKind.value === 'mobile' ? STAGE_LEFT_W_MOBILE : STAGE_LEFT_W_PC)
const STAGE_LEFT_H = computed(() => previewKind.value === 'mobile' ? STAGE_LEFT_H_MOBILE : STAGE_LEFT_H_PC)
const STAGE_W = computed(() => STAGE_LEFT_W.value + STAGE_GAP + STAGE_RIGHT_W)
const STAGE_H = computed(() => Math.max(STAGE_LEFT_H.value, STAGE_RIGHT_H))

const isNarrowViewport = ref(false)
const viewportWidth = ref(typeof window === 'undefined' ? 1280 : window.innerWidth)
const stageWrapRef = ref<HTMLElement | null>(null)
const stageScale = ref(1)
let stageRo: ResizeObserver | null = null
let stageWrapObservedWidth = 0

const stageOuterW = computed(() => STAGE_W.value * stageScale.value)
const stageOuterH = computed(() => STAGE_H.value * stageScale.value)

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function updateNarrowViewport() {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
  isNarrowViewport.value = window.matchMedia('(max-width: 899px)').matches
}

const narrowPcPreviewWidth = computed(() => clamp(viewportWidth.value - 30, 300, 390))
const narrowPcPreviewScale = computed(() => narrowPcPreviewWidth.value / LAPTOP_PREVIEW_TOTAL_W)
const narrowPcPreviewOuterStyle = computed(() => ({
  width: `${Math.round(LAPTOP_PREVIEW_TOTAL_W * narrowPcPreviewScale.value)}px`,
  height: `${Math.round(LAPTOP_PREVIEW_H * narrowPcPreviewScale.value)}px`,
}))
const narrowPcPreviewInnerStyle = computed(() => ({
  width: `${STAGE_LEFT_W_PC}px`,
  height: `${STAGE_LEFT_H_PC}px`,
  transform: `scale(${narrowPcPreviewScale.value})`,
  transformOrigin: 'top left',
}))

const narrowMobilePreviewWidth = computed(() => clamp(viewportWidth.value - 46, 300, 370))
const narrowMobilePreviewScale = computed(() => narrowMobilePreviewWidth.value / PHONE_PREVIEW_W)
const narrowMobilePreviewOuterStyle = computed(() => ({
  width: `${Math.round(PHONE_PREVIEW_W * narrowMobilePreviewScale.value)}px`,
  height: `${Math.round(PHONE_PREVIEW_H * narrowMobilePreviewScale.value)}px`,
}))
const narrowMobilePreviewInnerStyle = computed(() => ({
  width: `${PHONE_PREVIEW_W}px`,
  height: `${PHONE_PREVIEW_H}px`,
  transform: `scale(${narrowMobilePreviewScale.value})`,
  transformOrigin: 'top left',
}))

function recomputeStageScale() {
  if (isNarrowViewport.value) return
  const el = stageWrapRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const padding = 16
  const availW = Math.max(0, rect.width - padding * 2)
  const availH = Math.max(0, window.innerHeight - 200)
  const s = Math.min(availW / STAGE_W.value, availH / STAGE_H.value, 1)
  stageScale.value = clamp(Number.isFinite(s) ? s : 1, 0.22, 1)
}

const debouncedRecomputeStageScale = debounce(() => {
  recomputeStageScale()
}, VIEWPORT_RESIZE_DEBOUNCE_MS)

const {
  onResize: onViewportWidthResize,
  cancel: cancelViewportWidthResize,
  syncWidth: syncViewportWidthForResize,
} = createWidthOnlyDebouncedWindowResize(() => {
  updateNarrowViewport()
  updateColumnCount()
  updateMobileRecommendColumns()
  if (isNarrowViewport.value) {
    teardownStageObserver()
    stageScale.value = 1
  } else {
    void setupStageObserver()
  }
}, VIEWPORT_RESIZE_DEBOUNCE_MS)

function teardownStageObserver() {
  debouncedRecomputeStageScale.cancel()
  stageRo?.disconnect()
  stageRo = null
}

async function setupStageObserver() {
  teardownStageObserver()
  await nextTick()
  if (isNarrowViewport.value) return
  recomputeStageScale()
  const el = stageWrapRef.value
  if (!el) return
  stageWrapObservedWidth = Math.round(el.getBoundingClientRect().width)
  stageRo = new ResizeObserver(([entry]) => {
    const w = Math.round(entry?.contentRect?.width ?? 0)
    if (w === stageWrapObservedWidth) return
    stageWrapObservedWidth = w
    debouncedRecomputeStageScale()
  })
  stageRo.observe(el)
}

onMounted(() => {
  syncViewportWidthForResize()
  updateNarrowViewport()
  void setupStageObserver()
  window.addEventListener('resize', onViewportWidthResize, { passive: true })
})

watch(isNarrowViewport, () => {
  if (isNarrowViewport.value) {
    teardownStageObserver()
    stageScale.value = 1
  } else {
    void setupStageObserver()
  }
})

onBeforeUnmount(() => {
  cancelViewportWidthResize()
  window.removeEventListener('resize', onViewportWidthResize)
  teardownStageObserver()
})

const wallpaperId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw) ? raw[0] ?? '' : (raw ?? '')
})

const wallpaper = ref<CachedWallpaperDetail | null>(null)

function loadCache() {
  const id = wallpaperId.value
  if (!id) {
    wallpaper.value = null
    return
  }
  wallpaper.value = readWallpaperDetailCache(id)
}

watch(wallpaperId, loadCache, { immediate: true })

const queryKind = computed((): WallpaperDetailKind | null => {
  const q = route.query.kind
  const v = Array.isArray(q) ? q[0] : q
  return v === 'mobile' || v === 'pc' ? v : null
})

const previewKind = computed((): WallpaperDetailKind => {
  if (queryKind.value) return queryKind.value
  return wallpaper.value?.kind ?? 'pc'
})

const displayWallpaper = computed((): WallpaperItem => {
  const w = wallpaper.value
  if (w) {
    return {
      id: w.id,
      imageUrl: w.imageUrl,
      originalUrl: w.originalUrl,
      downloadUrl: w.downloadUrl,
      title: w.title,
      tags: w.tags ?? [],
      classificationTag: w.classificationTag,
      classificationTags: w.classificationTags,
      favoriteCount: w.favoriteCount,
      downloadCount: w.downloadCount,
      isFavorited: w.isFavorited,
      resolution: w.resolution,
      fileSizeLabel: w.fileSizeLabel,
    }
  }
  return {
    id: wallpaperId.value,
    imageUrl: '',
    tags: [],
  }
})

/** 详情大图：优先 originalUrl，与列表 webp 区分 */
const detailPreviewImageUrl = computed(() => {
  const o = displayWallpaper.value.originalUrl?.trim()
  if (o) return o
  return displayWallpaper.value.imageUrl
})

const liveFavoriteCount = ref(0)
const liveDownloadCount = ref(0)
const liveFavorited = ref(false)
const downloadPending = ref(false)
const favoritePending = ref(false)

watch(
  () => wallpaper.value,
  (w) => {
    if (!w) {
      liveFavoriteCount.value = 0
      liveDownloadCount.value = 0
      liveFavorited.value = false
      return
    }
    liveFavoriteCount.value = w.favoriteCount ?? 0
    liveDownloadCount.value = w.downloadCount ?? 0
    liveFavorited.value = w.isFavorited === true
  },
  { immediate: true, deep: true },
)

const cardDisplayWallpaper = computed((): WallpaperItem => ({
  ...displayWallpaper.value,
  favoriteCount: liveFavoriteCount.value,
  downloadCount: liveDownloadCount.value,
}))

/** 详情页有 id 即可走同源 GET /pc|mobile-wallpapers/:id/file，不依赖外链是否跨域 */
const downloadDisabled = computed(() => !String(wallpaperId.value || '').trim())

function persistDetailStats() {
  const id = wallpaperId.value
  if (!id) return
  const prev = wallpaper.value
  const base: CachedWallpaperDetail =
    prev ??
    ({
      id,
      imageUrl: displayWallpaper.value.imageUrl,
      originalUrl: displayWallpaper.value.originalUrl,
      downloadUrl: displayWallpaper.value.downloadUrl,
      title: displayWallpaper.value.title,
      tags: displayWallpaper.value.tags ?? [],
      classificationTag: displayWallpaper.value.classificationTag,
      classificationTags: displayWallpaper.value.classificationTags,
      resolution: displayWallpaper.value.resolution,
      fileSizeLabel: displayWallpaper.value.fileSizeLabel,
      kind: previewKind.value,
    } as CachedWallpaperDetail)

  cacheWallpaperForDetail({
    ...base,
    favoriteCount: liveFavoriteCount.value,
    downloadCount: liveDownloadCount.value,
    isFavorited: liveFavorited.value,
    kind: previewKind.value,
  })
  wallpaper.value = readWallpaperDetailCache(id)
}

function suggestDownloadBasename() {
  const t = displayWallpaper.value.title?.trim()
  if (t) return t
  return `壁纸-${wallpaperId.value}`
}

async function onDownload() {
  const id = String(wallpaperId.value || '').trim()
  if (!id || downloadPending.value) return
  const hintUrl = (
    displayWallpaper.value.downloadUrl ||
    displayWallpaper.value.originalUrl ||
    displayWallpaper.value.imageUrl
  ).trim()
  downloadPending.value = true
  try {
    try {
      const blob = await fetchWallpaperFileBlob(id, previewKind.value)
      saveBlobAsDownload(blob, suggestDownloadBasename(), hintUrl)
    } catch (apiErr) {
      /** 优先同源 GET /file；仅当仍有可请求的直链时再浏览器拉取（跨域需 CORS） */
      const direct = (
        displayWallpaper.value.downloadUrl ||
        displayWallpaper.value.originalUrl ||
        displayWallpaper.value.imageUrl
      ).trim()
      if (!direct) {
        const m = apiErr instanceof Error ? apiErr.message : String(apiErr)
        throw new Error(`接口拉取失败：${m}。当前无图片直链，无法回退下载。`)
      }
      await downloadImageFile(direct, suggestDownloadBasename())
    }
    const patch = await reportWallpaperDownloaded(wallpaperId.value, previewKind.value)
    if (patch.downloadCount != null) {
      liveDownloadCount.value = patch.downloadCount
    } else {
      liveDownloadCount.value = (liveDownloadCount.value ?? 0) + 1
    }
    if (patch.favoriteCount != null) liveFavoriteCount.value = patch.favoriteCount
    if (patch.isFavorited !== undefined) liveFavorited.value = patch.isFavorited
    persistDetailStats()
  } catch (e) {
    const msg = e instanceof Error ? e.message : '下载失败'
    if (typeof window !== 'undefined') window.alert(msg)
  } finally {
    downloadPending.value = false
  }
}


async function onToggleFavorite() {
  if (favoritePending.value) return
  const next = !liveFavorited.value
  favoritePending.value = true
  try {
    const patch = await reportWallpaperFavorite(wallpaperId.value, next, previewKind.value)
    if (patch.isFavorited !== undefined) {
      liveFavorited.value = patch.isFavorited
    } else {
      liveFavorited.value = next
    }
    if (patch.favoriteCount != null) {
      liveFavoriteCount.value = patch.favoriteCount
    } else {
      liveFavoriteCount.value = Math.max(0, (liveFavoriteCount.value ?? 0) + (next ? 1 : -1))
    }
    persistDetailStats()
  } catch (e) {
    const msg = e instanceof Error ? e.message : '收藏操作失败'
    if (typeof window !== 'undefined') window.alert(msg)
  } finally {
    favoritePending.value = false
  }
}

/** 手机壁纸详情不铺全屏模糊背景图 */
const backdropVisible = computed(
  () =>
    previewKind.value !== 'mobile' &&
    !themeLight.value &&
    Boolean(detailPreviewImageUrl.value?.trim()),
)

const backdropImage = computed(() => {
  const u = detailPreviewImageUrl.value
  if (!u) return 'none'
  return `url(${JSON.stringify(u)})`
})

watch(
  [backdropVisible, detailPreviewImageUrl],
  ([vis, url]) => {
    if (vis && url?.trim()) rememberWallpaperBackdropUrl(url.trim())
  },
  { immediate: true },
)

const categoryLine = computed(() => {
  const raw = displayWallpaper.value.classificationTag?.trim()
  if (raw) return raw

  const cls = (displayWallpaper.value.classificationTags ?? []).map((item) => item.trim()).filter(Boolean)
  if (cls.length === 0) return '—'
  return cls.join('|')
})

const colorHint = computed(() => '偏主题色')

const publishedAt = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})

// ===== 相似推荐 =====
const recommendations = ref<WallpaperItem[]>([])
const recommendPage = ref(1)
const recommendLoading = ref(false)
const recommendLoadingAll = ref(false)
const recommendEpoch = ref(0)
const recommendLoadMoreRef = ref<HTMLElement | null>(null)
const recommendKeywords = ref<string[]>([])
let recommendObserver: IntersectionObserver | null = null

// 计算列数（复用列表页逻辑）
const columnCount = ref(4)
const mobileRecommendColumns = ref(2)

function updateColumnCount() {
  if (typeof window === 'undefined') return
  const w = window.innerWidth
  if (w < 768) {
    columnCount.value = 2
  } else if (w < 1024) {
    columnCount.value = 3
  } else {
    columnCount.value = 4
  }
}

function updateMobileRecommendColumns() {
  if (typeof window === 'undefined') return
  mobileRecommendColumns.value = window.matchMedia('(min-width: 900px)').matches ? 4 : 2
}

function getRevealDelay(idx: number): string {
  const col = columnCount.value
  const row = Math.floor(idx / col)
  const sec = row * 0.05 + (idx % col) * 0.03
  return `${sec}s`
}

/**
 * 过滤掉疑似 ID 的标签，只保留有效的文本标签
 * ID 特征：纯字母数字组合、很长的字符串、包含特殊字符等
 */
function isValidTag(tag: string): boolean {
  if (!tag || tag.length === 0) return false

  // 过滤掉太长的标签（可能是 ID）
  if (tag.length > 20) {
    return false
  }

  // 过滤掉纯数字
  if (/^\d+$/.test(tag)) {
    return false
  }

  // 过滤掉看起来像 ID 的字符串（长字母数字组合，如 a754117de8bf）
  if (/^[a-zA-Z0-9]{8,}$/.test(tag)) {
    return false
  }

  // 过滤掉包含特殊字符的标签（除了常见的中文标点）
  if (/[<>{}[\]\\^`]/.test(tag)) {
    return false
  }

  return true
}

const SUBJECT_TERMS = [
  '美女', '少女', '人像', '写真', '动漫', '二次元', 'JK', 'jk', '制服', '居家', '休闲',
]
const STYLE_TERMS = [
  '复古', '古风', '国风', '港风', '赛博', '写实', '插画', '手绘', '胶片',
]
const SCENE_TERMS = ['夜景', '风景', '城市', '街景', '室内']
const MOOD_TERMS = ['氛围感', '暖调', '冷调', '柔和', '素雅', '清新', '治愈']
const IGNORE_SEGMENTS = ['画风', '风格', '系列', '合集', '壁纸']

function uniqueOrdered(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value)
      result.push(value)
    }
  }
  return result
}

function getSourceTagsForRecommend(): string[] {
  const currentWallpaper = wallpaper.value || displayWallpaper.value
  let tags = currentWallpaper?.tags ?? []

  if (tags.length === 0 && currentWallpaper?.classificationTags && currentWallpaper.classificationTags.length > 0) {
    tags = currentWallpaper.classificationTags
  }

  if (tags.length === 0) {
    const rawData = currentWallpaper as { classificationTag?: unknown } | null
    const classificationTagStr = rawData?.classificationTag
    if (typeof classificationTagStr === 'string' && classificationTagStr.trim()) {
      tags = classificationTagStr
        .split(/[|\/,，、]/)
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0)
    }
  }

  return tags.filter(isValidTag)
}

function extractKeywords(tags: string[]): string[] {
  const result: string[] = []
  const glossary = [...SUBJECT_TERMS, ...STYLE_TERMS, ...SCENE_TERMS, ...MOOD_TERMS]

  for (const rawTag of tags) {
    const cleaned = rawTag.trim()
    if (!cleaned || !isValidTag(cleaned)) continue

    result.push(cleaned)

    const splitParts = cleaned
      .split(/[-_/|,，、\s]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item !== cleaned && isValidTag(item))
    result.push(...splitParts)

    const matchedTerms = glossary.filter((term) => cleaned.includes(term))
    result.push(...matchedTerms)

    if (matchedTerms.length === 0 && cleaned.length >= 4 && cleaned.length <= 8) {
      for (let size = 2; size <= 3; size++) {
        for (let i = 0; i <= cleaned.length - size; i++) {
          const part = cleaned.slice(i, i + size)
          if (IGNORE_SEGMENTS.includes(part)) continue
          if (isValidTag(part)) result.push(part)
        }
      }
    }
  }

  const keywords = uniqueOrdered(
    result
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && isValidTag(item) && !IGNORE_SEGMENTS.includes(item)),
  )

  return keywords
}

function keywordScore(keyword: string): number {
  let score = 0
  if (SUBJECT_TERMS.includes(keyword)) score += 120
  if (STYLE_TERMS.includes(keyword)) score += 100
  if (SCENE_TERMS.includes(keyword)) score += 90
  if (MOOD_TERMS.includes(keyword)) score += 70
  if (keyword.length >= 2 && keyword.length <= 4) score += 25
  if (keyword.length >= 5 && keyword.length <= 8) score += 12
  if (keyword.length > 10) score -= 20
  return score
}

function choosePrimaryKeyword(keywords: string[]): string | undefined {
  return [...keywords].sort((a, b) => {
    const diff = keywordScore(b) - keywordScore(a)
    if (diff !== 0) return diff
    return a.length - b.length
  })[0]
}

function scoreRecommendation(item: WallpaperItem, keywords: string[]): number {
  const title = item.title?.trim() ?? ''
  const pool = uniqueOrdered([
    ...filterTagsForDisplay(item.tags ?? []),
    ...(item.classificationTags ?? []),
    title,
  ]).join(' | ')

  let score = 0
  for (const keyword of keywords) {
    if (!keyword) continue
    if (title === keyword) score += 80
    else if (title.includes(keyword)) score += 30

    if ((item.classificationTags ?? []).includes(keyword)) score += 50
    if ((item.tags ?? []).includes(keyword)) score += 40
    else if (pool.includes(keyword)) score += 12
  }

  score += Math.min(item.downloadCount ?? 0, 5000) / 100
  return score
}

function onRecommendTileClick(item: WallpaperItem) {
  cacheWallpaperForDetail({ ...item, kind: 'mobile' })
  router.push({
    name: ROUTE_NAME_WALLPAPER_DETAIL,
    params: { id: String(item.id) },
    query: { kind: 'mobile' },
  })
}

async function loadRecommendations() {


  if (recommendLoading.value || recommendLoadingAll.value) {
    return
  }

  if (recommendKeywords.value.length === 0) {
    const validTags = getSourceTagsForRecommend()

    if (validTags.length === 0) {
      recommendLoadingAll.value = true
      return
    }

    recommendKeywords.value = extractKeywords(validTags)

    if (recommendKeywords.value.length === 0) {
      recommendLoadingAll.value = true
      return
    }
  }

  const keyword = choosePrimaryKeyword(recommendKeywords.value)
  if (!keyword || !isValidTag(keyword)) {
    recommendLoadingAll.value = true
    return
  }

  recommendLoading.value = true
  try {
    const result = await fetchDetailRecommendationsPage({
      page: 1,
      pageSize: 32,
      tag: keyword,
      sort: '-downloadCount',
      deviceType: previewKind.value === 'mobile' ? 'Mobile' : 'PC',
    })


    if (result.items.length === 0) {
      recommendLoadingAll.value = true
      return
    }

    // 过滤掉当前壁纸和已存在的壁纸（去重）
    const existingIds = new Set(recommendations.value.map(item => String(item.id)))
    existingIds.add(String(wallpaperId.value))

    const newItems = result.items
      .filter(item => !existingIds.has(String(item.id)))
      .sort((a, b) => scoreRecommendation(b, recommendKeywords.value) - scoreRecommendation(a, recommendKeywords.value))


    if (newItems.length > 0) {
      recommendations.value = newItems
      recommendEpoch.value++
    } else {
      console.log('[推荐-调试] 去重后无新数据')
    }

    recommendLoadingAll.value = true
  } catch (e) {
    recommendLoadingAll.value = true
  } finally {
    recommendLoading.value = false
  }
}

function setupRecommendObserver() {
  if (!recommendLoadMoreRef.value) return

  recommendObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !recommendLoading.value)
          loadRecommendations()
      })
    },
    {
      rootMargin: '200px',
      threshold: 0.1  // 添加阈值，避免过于敏感
    }
  )

  recommendObserver.observe(recommendLoadMoreRef.value)
}

function teardownRecommendObserver() {
  if (recommendObserver) {
    recommendObserver.disconnect()
    recommendObserver = null
  }
}

// 监听壁纸变化，重置推荐
watch(wallpaperId, () => {
  recommendations.value = []
  recommendPage.value = 1
  recommendLoadingAll.value = false
  recommendKeywords.value = []
  recommendEpoch.value++
  void loadRecommendations()
}, { immediate: true })

// 监听 recommendLoadMoreRef 变化，设置观察器
watch(recommendLoadMoreRef, (el) => {
  teardownRecommendObserver()
  if (el) {
    void nextTick(() => setupRecommendObserver())
  }
})




onMounted(() => {
  updateColumnCount()
  updateMobileRecommendColumns()

})

onBeforeUnmount(() => {
  teardownRecommendObserver()
})
</script>

<style scoped>
.detail-narrow-pc-row,
.detail-narrow-mobile-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
  width: 100%;
}

.detail-pc-preview-stage,
.detail-mobile-preview-stage {
  display: flex;
  width: 100%;
  justify-content: center;
}

.detail-pc-preview-scale,
.detail-mobile-preview-scale {
  position: relative;
  flex: none;
  overflow: visible;
}

.detail-pc-preview-scale {
  padding: 15px;
  box-sizing: border-box;
}

.detail-pc-meta-card {
  margin-top: 30px;
  width: min(100%, 410px);
}

.detail-mobile-meta-card {
  width: min(100%, 430px);
  margin-top: -0.35rem;
}


.detail-mobile-preview-scale {
  display: flex;
}

@media (max-width: 899px) {
  .detail-mobile-preview-shell {
    width: min(100%, 390px);
    padding: 12px 8px;
  }

  .detail-mobile-meta-card,
  .detail-pc-meta-card {
    width: min(100%, 392px);
  }
}

/* 推荐列表样式 */
.wallpaper-grid-reveal {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wallpaper-tile {
  content-visibility: auto;
  contain-intrinsic-size: 240px 180px;
  animation: reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--wallpaper-reveal-delay, 0s);
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>

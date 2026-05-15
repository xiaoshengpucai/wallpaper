<template>
  <section class="mx-auto flex w-full min-w-0 flex-col max-[899px]:px-2 max-[899px]:sm:px-4">
    <div v-if="loadError" class="mb-4 shrink-0 rounded-2xl border px-4 py-3 text-sm"
      :class="themeLight ? 'border-red-200 bg-red-50 text-red-800' : 'border-red-400/40 bg-red-950/40 text-red-200'">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span>{{ loadError }}</span>
        <button type="button" class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition"
          :class="themeLight ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500/90 text-white hover:bg-red-500'"
          @click="retryLoad">
          重试
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="relative min-h-[min(520px,70vh)]">
      <!-- 骨架屏：首次加载且无内容 -->
      <div v-if="showFullSkeleton" class="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4" aria-hidden="true">
        <div v-for="n in listPageSize" :key="'sk-' + n" class="aspect-[9/19] animate-pulse rounded-[10px]"
          :class="themeLight ? 'bg-slate-200/90' : 'bg-white/10'" />
      </div>

      <template v-else>
        <!-- 翻页时叠加骨架遮罩 -->
        <div v-if="showFetchOverlay"
          class="absolute inset-0 z-10 grid grid-cols-2 gap-3 rounded-2xl min-[900px]:grid-cols-4"
          :class="themeLight ? 'bg-[#DBDBDB]/85 backdrop-blur-[2px]' : 'bg-[#393939]/80 backdrop-blur-[2px]'"
          aria-busy="true" aria-label="加载中">
          <div v-for="n in listPageSize" :key="'ov-' + n" class="aspect-[9/19] animate-pulse rounded-[10px]"
            :class="themeLight ? 'bg-slate-200/90' : 'bg-white/15'" />
        </div>

        <WallpaperMasonry v-if="items.length > 0" class="w-full" measure-wrap-class="max-w-none px-0" page-scroll
          :items="items" :light-theme="themeLight" :fixed-columns="masonryColumns" :has-more="hasMore"
          :loading="loadingMore" :duration="0.6" :stagger="0.05" animate-from="bottom" :scale-on-hover="true"
          :hover-scale="0.95" :blur-to-focus="true" :color-shift-on-hover="false" @load-more="onLoadMore"
          @tile-click="onTileClick" />

        <div v-else-if="!loading"
          class="flex min-h-[280px] flex-col items-center justify-center py-12 text-center text-sm"
          :class="themeLight ? 'text-slate-600' : 'text-slate-400'">
          当前页暂无壁纸数据。
        </div>
      </template>
    </div>

    <!-- 底部 dock 占位：防止 fixed dock 遮挡内容 -->
    <div v-show="dockPinned" class="w-full shrink-0" :style="{ height: `${dockSpacerHeight}px` }" aria-hidden="true" />

    <!-- 搜索 + 移动端分页 dock；未到页面底部时 fixed 吸底（全分辨率） -->
    <div
      ref="dockWrapRef"
      class="flex flex-col items-center gap-3"
      :class="
        dockPinned
          ? themeLight
            ? 'fixed inset-x-0 bottom-0 z-40 mt-0 bg-gradient-to-t from-[#DBDBDB]/92 from-45% to-transparent px-4 pt-2 pb-[max(0.375rem,env(safe-area-inset-bottom))]'
            : 'fixed inset-x-0 bottom-0 z-40 mt-0 bg-gradient-to-t from-black/60 from-45% to-transparent px-4 pt-2 pb-[max(0.375rem,env(safe-area-inset-bottom))]'
          : 'relative mt-8 pb-2'
      "
      style="padding-bottom: 50px;"
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

      <!-- 移动端分页导航（桌面使用左侧侧边栏） -->
      <div v-if="totalPages > 1" class="relative min-[900px]:hidden w-full">
        <!-- Go 跳页弹出框 -->
        <Transition name="go-popup">
          <div
            v-if="goPopupOpen"
            class="absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2"
          >
            <div
              class="rounded-2xl border p-3 shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              :class="themeLight ? 'border-slate-200 bg-white/92 text-slate-800' : 'border-white/15 bg-slate-900/92 text-slate-100'"
            >
              <p class="mb-2 text-center text-[11px] opacity-55">跳转页码（共 {{ totalPages }} 页）</p>
              <input
                ref="goInputRef"
                v-model="goInput"
                type="number"
                :min="1"
                :max="totalPages"
                placeholder="输入页码"
                class="w-full rounded-xl border bg-transparent px-3 py-1.5 text-center text-sm outline-none"
                :class="themeLight ? 'border-slate-300 text-slate-800' : 'border-white/20 text-slate-100'"
                @keydown.enter="submitGoJump"
                @keydown.esc="closeGoPopup"
              />
              <div class="mt-2 flex gap-2">
                <button
                  type="button"
                  class="flex-1 rounded-xl py-1.5 text-xs transition"
                  :class="themeLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/10 text-slate-300 hover:bg-white/15'"
                  @click="closeGoPopup"
                >取消</button>
                <button
                  type="button"
                  class="flex-1 rounded-xl py-1.5 text-xs font-semibold transition"
                  :class="themeLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/90 text-slate-900 hover:bg-white'"
                  @click="submitGoJump"
                >前往</button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- 分页条：← [页码居中] → Go -->
        <div
          class="flex w-full items-center rounded-full border px-1.5 py-1 backdrop-blur"
          :class="themeLight ? 'border-slate-200 bg-white/60' : 'border-white/10 bg-white/5'"
        >
          <!-- ← 上一页（左对齐） -->
          <button
            type="button"
            class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs transition disabled:opacity-40"
            :class="themeLight ? 'text-slate-700 hover:bg-black/5' : 'text-slate-100 hover:bg-white/10'"
            :disabled="currentPage === 1 || loading"
            title="上一页"
            @click="goTo(currentPage - 1)"
          >←</button>

          <!-- 页码居中 -->
          <div class="flex flex-1 items-center justify-center gap-0.5">
            <template v-for="item in mobilePageStrip" :key="item ?? 'mob-ellipsis'">
              <span v-if="item === null" class="px-0.5 text-xs opacity-40">…</span>
              <button
                v-else
                type="button"
                class="grid h-7 min-w-[1.75rem] place-items-center rounded-full px-0.5 text-xs tabular-nums transition"
                :class="
                  item === displayPage
                    ? themeLight
                      ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.35)]'
                      : 'bg-white text-slate-900 shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                    : themeLight
                      ? 'text-slate-700 hover:bg-black/5'
                      : 'text-slate-100 hover:bg-white/10'
                "
                :disabled="loading"
                @click="goTo(item)"
              >{{ item }}</button>
            </template>
          </div>

          <!-- → 下一页 + Go（右对齐） -->
          <div class="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full text-xs transition disabled:opacity-40"
              :class="themeLight ? 'text-slate-700 hover:bg-black/5' : 'text-slate-100 hover:bg-white/10'"
              :disabled="currentPage === totalPages || loading"
              title="下一页"
              @click="goTo(currentPage + 1)"
            >→</button>
            <button
              type="button"
              class="h-7 rounded-full px-2 text-[10px] font-semibold transition"
              :class="
                goPopupOpen
                  ? themeLight ? 'bg-blue-600 text-white' : 'bg-white text-slate-900'
                  : themeLight ? 'text-slate-700 hover:bg-black/5' : 'text-slate-100 hover:bg-white/10'
              "
              @click="toggleGoPopup"
            >Go</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 分页侧边栏：固定在左侧垂直居中（仅桌面 ≥ 900px 显示） -->
  <Teleport to="body">
    <nav
      v-if="totalPages > 1"
      class="page-sidebar fixed left-3 top-1/2 z-40 -translate-y-1/2 max-[899px]:hidden"
      aria-label="分页导航"
    >
      <div
        class="flex flex-col items-center gap-1 rounded-2xl border px-1.5 py-2 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.22)]"
        :class="themeLight ? 'border-slate-200/80 bg-white/70 text-slate-700' : 'border-white/10 bg-white/8 text-slate-100'"
      >
        <!-- ↑ 上一页 -->
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-full text-sm transition disabled:opacity-30"
          :class="themeLight ? 'hover:bg-black/6' : 'hover:bg-white/10'"
          :disabled="currentPage === 1 || loading"
          title="上一页"
          @click="goTo(currentPage - 1)"
        >↑</button>

        <div class="my-0.5 h-px w-5 opacity-20" :class="themeLight ? 'bg-slate-500' : 'bg-white'" />

        <!-- 页码（桌面最多显示 10 个） -->
        <template v-for="item in desktopPageStrip" :key="item ?? 'desk-ellipsis'">
          <span v-if="item === null" class="text-[10px] leading-none opacity-40">…</span>
          <button
            v-else
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full text-xs tabular-nums transition"
            :class="
              item === displayPage
                ? themeLight
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                  : 'bg-white text-slate-900 shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                : themeLight
                  ? 'hover:bg-black/6'
                  : 'hover:bg-white/10'
            "
            :disabled="loading"
            @click="goTo(item)"
          >{{ item }}</button>
        </template>

        <div class="my-0.5 h-px w-5 opacity-20" :class="themeLight ? 'bg-slate-500' : 'bg-white'" />

        <!-- ↓ 下一页 -->
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-full text-sm transition disabled:opacity-30"
          :class="themeLight ? 'hover:bg-black/6' : 'hover:bg-white/10'"
          :disabled="currentPage === totalPages || loading"
          title="下一页"
          @click="goTo(currentPage + 1)"
        >↓</button>

        <div class="my-0.5 h-px w-5 opacity-20" :class="themeLight ? 'bg-slate-500' : 'bg-white'" />

        <!-- Go 按钮 + 弹出框（右侧弹出） -->
        <div class="relative">
          <Transition name="go-popup">
            <div
              v-if="goPopupOpen"
              class="absolute left-full top-1/2 z-50 ml-2 w-48 -translate-y-1/2"
            >
              <div
                class="rounded-2xl border p-3 shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl"
                :class="themeLight ? 'border-slate-200 bg-white/92 text-slate-800' : 'border-white/15 bg-slate-900/92 text-slate-100'"
              >
                <p class="mb-2 text-center text-[11px] opacity-55">跳转页码（共 {{ totalPages }} 页）</p>
                <input
                  ref="goInputRef"
                  v-model="goInput"
                  type="number"
                  :min="1"
                  :max="totalPages"
                  placeholder="输入页码"
                  class="w-full rounded-xl border bg-transparent px-3 py-1.5 text-center text-sm outline-none"
                  :class="themeLight ? 'border-slate-300 text-slate-800' : 'border-white/20 text-slate-100'"
                  @keydown.enter="submitGoJump"
                  @keydown.esc="closeGoPopup"
                />
                <div class="mt-2 flex gap-2">
                  <button
                    type="button"
                    class="flex-1 rounded-xl py-1.5 text-xs transition"
                    :class="themeLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/10 text-slate-300 hover:bg-white/15'"
                    @click="closeGoPopup"
                  >取消</button>
                  <button
                    type="button"
                    class="flex-1 rounded-xl py-1.5 text-xs font-semibold transition"
                    :class="themeLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/90 text-slate-900 hover:bg-white'"
                    @click="submitGoJump"
                  >前往</button>
                </div>
              </div>
            </div>
          </Transition>

          <button
            type="button"
            class="h-7 w-8 rounded-full text-[10px] font-semibold transition"
            :class="
              goPopupOpen
                ? themeLight ? 'bg-blue-600 text-white' : 'bg-white text-slate-900'
                : themeLight ? 'hover:bg-black/6 text-slate-700' : 'hover:bg-white/10 text-slate-100'
            "
            @click="toggleGoPopup"
          >Go</button>
        </div>
      </div>
    </nav>
  </Teleport>

  <!-- 返回顶部 FAB -->
  <Teleport to="body">
    <button v-show="showBackToTop" type="button"
      class="back-to-top-fab fixed z-[45] cursor-pointer border-0 bg-transparent p-1 transition-[transform,filter] duration-300 ease-[cubic-bezier(0.34,1.45,0.64,1)] will-change-transform hover:scale-110 hover:-translate-y-2 hover:drop-shadow-[0_10px_28px_rgba(242,107,107,0.5)] active:scale-95 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:translate-y-0"
      aria-label="返回顶部" @click="scrollToTop">
      <span
        class="pointer-events-none absolute left-1/2 top-[72%] z-0 h-14 w-[4.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-400/50 via-orange-400/45 to-amber-400/40 blur-2xl"
        aria-hidden="true" />
      <svg class="relative z-[1] block h-[72px] w-[72px]" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true">
        <path
          d="M511.5 802.7c7.3 0 13.3 7.3 13.3 16.3v86.2c0 9-5.9 16.4-13.3 16.4-7.3 0-13.3-7.3-13.3-16.3v-86.2c0-9.1 6-16.4 13.3-16.4z m77.7 39.8c7.3 0 13.3 7.3 13.3 16.3V945c0 9-5.9 16.4-13.3 16.4-7.3 0-13.3-7.3-13.3-16.3v-86.2c0-9.1 6-16.4 13.3-16.4z m-155.4 0c7.3 0 13.3 7.3 13.3 16.3V945c0 9-5.9 16.4-13.3 16.4-7.3 0-13.3-7.3-13.3-16.3v-86.2c0-23.1 16.1-16.4 13.3-16.4z m0 0"
          fill="#F26B6B" />
        <path d="M330.6 489.6s-107.8 41.8-96.4 275.1l164.6-90.3-68.2-184.8z m0 0" fill="#FCEBEB" />
        <path
          d="M408.9 678.3l-182.3 100-0.6-13.1c-6.5-133.6 25.9-205.8 54.3-242.8 23.7-31 46.4-40 47.4-40.4l7.8-3 73.4 199.3z m-167 72.8l146.7-80.5-62.4-169.3c-7.5 4.7-20 14.2-32.8 31-25.9 33.7-55.2 98.7-51.5 218.8z m0 0"
          fill="#380505" />
        <path d="M679.6 489.5s107.9 41.8 96.6 275l-164.6-90.2 68-184.8z m0 0" fill="#FCEBEB" />
        <path
          d="M783.7 778.1l-182.4-99.9 73.4-199.4 7.8 3c4.6 1.8 113.3 46.6 101.8 283.1l-0.6 13.2z m-162-107.5L768.5 751c5.3-178.1-61.6-235.5-84.4-249.8l-62.4 169.4z m0 0"
          fill="#380505" />
        <path
          d="M679.1 433.4c0-199.8-78-361.8-174.1-361.8S331 233.7 331 433.5c0 130.2 33.2 244.2 82.8 307.9 0.2 0.5 0.6 0.9 1 1.3 2 1.8 87-57.2 173.5 0.4 1 0.7 2.2 1 3.4 1 1.5 0 3.1-0.5 4.1-1.6 0.3-0.3 0.6-0.7 0.8-1.2 49.6-63.7 82.6-177.8 82.5-307.9z m0 0"
          fill="#FCEBEB" />
        <path
          d="M602.6 747.2l-1.1 1.3c-2.5 2.4-6.1 3.8-9.8 3.8-2.8 0-5.6-0.8-8-2.4-46.5-31-100.2-31.7-159.5-2.2-6 3-10.3 5.1-14.8 1.2-0.8-0.7-1.5-1.5-2.1-2.4-52.9-67.9-84.5-184.9-84.5-312.9 0-127.1 31.1-243.7 83.3-311.8 29.2-38.2 63.4-58.3 98.9-58.3 100.5 0 182.3 166 182.4 370 0 127.1-31.1 243.6-83.3 311.7l-1.5 2z m-185.2-14.5c64-31.6 122.4-30.8 173.6 2.4 50-65.3 79.9-178.1 79.9-301.7-0.1-195-74.5-353.6-166-353.6-30.1 0-59.8 18-85.8 51.9-50.1 65.3-79.9 178.2-79.9 301.8 0.1 122.2 29.2 233.5 78.2 299.2z m0 0"
          fill="#380505" />
        <path d="M667.5 527.1l-330.4-1.6c2.5 15.6 5.5 31.1 9.2 46.5l311.9 1.5c3.7-15.3 6.8-30.8 9.3-46.4z m0 0"
          fill="#F26B6B" />
        <path
          d="M664.7 581.8l-324.9-1.6-1.5-6.3c-3.7-15.6-6.8-31.3-9.3-47.1l-1.5-9.6 349.7 1.7-1.5 9.5c-2.5 15.8-5.7 31.5-9.4 47l-1.6 6.4z m-311.9-18l298.9 1.4c2.3-9.9 4.3-19.9 6.1-30l-310.9-1.5c1.7 10.2 3.7 20.2 5.9 30.1z m0 0"
          fill="#380505" />
        <path d="M652.4 626.3l-294.4 0.1c2.8 11.2 7.9 25.5 15.2 38.2l264.1 1.4c5.6-10 12.3-28.5 15.1-39.7z m0 0"
          fill="#F26B6B" />
        <path
          d="M641.9 674.2l-273.6-1.4-2.3-4.1c-6.8-11.9-12.6-26.5-16-40.3l-2.5-10.2 315.4-0.1-2.5 10.2c-2.9 11.7-9.9 31.1-16 41.8l-2.5 4.1zM378 656.4l254.2 1.3c3.2-6.6 6.6-15.4 9.2-23.2l-272.6 0.1c2.5 7.5 5.6 14.8 9.2 21.8z m0 0"
          fill="#380505" />
        <path
          d="M459.5 391.5c32.7 25.1 79.5 18.9 104.6-13.8 25.1-32.7 18.9-79.5-13.8-104.6-32.7-25.1-79.5-18.9-104.6 13.8-25.1 32.7-18.9 79.5 13.8 104.6z m0 0"
          fill="#F26B6B" />
        <path
          d="M570.6 382.7c-27.8 36.2-79.8 43.1-116.1 15.4-36.2-27.8-43.1-79.9-15.4-116.1 27.8-36.2 79.9-43.1 116.1-15.4 36.3 27.8 43.1 79.8 15.4 116.1z m-118.4-90.8c-22.3 29-16.7 70.8 12.3 93 29 22.3 70.8 16.7 93-12.3 22.3-29 16.7-70.8-12.3-93-29-22.2-70.8-16.7-93 12.3z m0 0"
          fill="#380505" />
        <path
          d="M471.9 278.9c20.8-9.9 45.5-1.8 63.2 15.2 38.7 37.1 4.9 90.7-0.6 94.4 9-4.3 16.9-10.7 23-18.6 21.3-27.7 16-67.5-11.7-88.7-22.1-17.1-51.9-17.1-73.9-2.3z m0 0"
          fill="#FCEBEB" />
      </svg>
    </button>
  </Teleport>
</template>

<style scoped>
/* Go 弹窗过渡 */
.go-popup-enter-active,
.go-popup-leave-active {
  transition: opacity 0.16s ease, transform 0.16s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.go-popup-enter-from,
.go-popup-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.96);
}

/* 分页侧边栏：极窄屏缩小，避免遮挡内容过多 */
.page-sidebar {
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  scrollbar-width: none;
}

.page-sidebar::-webkit-scrollbar {
  display: none;
}

@media (max-width: 479px) {
  .page-sidebar {
    left: 0.25rem;
    transform: translateY(-50%) scale(0.85);
    transform-origin: left center;
    opacity: 0.82;
  }
}

/* 默认（宽屏）位置 */
.back-to-top-fab {
  bottom: calc(1.25rem + 100px);
  right: calc(1rem + 100px);
}

/* 移动端：贴右下角，留出底部 dock 和安全区域 */
@media (max-width: 899px) {
  .back-to-top-fab {
    right: max(1rem, env(safe-area-inset-right, 0px) + 1rem);
    bottom: max(8rem, env(safe-area-inset-bottom, 0px) + 8rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-to-top-fab {
    transition: none !important;
  }

  .back-to-top-fab:hover,
  .back-to-top-fab:active {
    transform: none !important;
    filter: none !important;
  }
}
</style>

<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'

import {
  DEFAULT_MOBILE_WALLPAPER_PAGE_SIZE,
  DEFAULT_MOBILE_WALLPAPER_SORT,
  fetchMobileWallpapersPage,
  type WallpaperItem,
  type WallpaperSuggestTagItem,
} from '../api/wallpapers'
import { debounce } from '../utils/debounce'
import { createDebouncedWindowResize, VIEWPORT_RESIZE_DEBOUNCE_MS } from '../utils/viewportResize'
import WallpaperMasonry from '../components/WallpaperMasonry.vue'
import WallpaperSearchToolbar from '../components/WallpaperSearchToolbar.vue'
import { ROUTE_NAME_WALLPAPER_DETAIL } from '../router'
import { cacheWallpaperForDetail } from '../utils/wallpaperDetailCache'

const router = useRouter()
const route = useRoute()
const appThemeLight = inject<Ref<boolean> | undefined>('appThemeLight', undefined)
const themeLight = computed(() => appThemeLight?.value === true)

const listPageSize = ref(DEFAULT_MOBILE_WALLPAPER_PAGE_SIZE)
const listSort = ref(DEFAULT_MOBILE_WALLPAPER_SORT)

// ── 列数 ──────────────────────────────────────────────
const masonryColumns = ref(2)
let masonryMqCleanup: (() => void) | undefined

function updateMasonryColumns() {
  if (typeof window === 'undefined') return
  masonryColumns.value = window.matchMedia('(min-width: 900px)').matches ? 4 : 2
}

// ── 列表数据 ──────────────────────────────────────────
const items = ref<WallpaperItem[]>([])
const total = ref(0)
/** 导航/搜索触发的主加载（会重置列表） */
const loading = ref(false)
/** 滚底追加时的加载状态（列表不重置） */
const loadingMore = ref(false)
const loadError = ref<string | null>(null)
let loadSeq = 0
/** 已累积加载到的最后一页（用于 onLoadMore 计算下一页） */
const loadedUpToPage = ref(0)
/** 无限滚动：还有更多数据 */
const hasMore = computed(() => items.value.length < total.value)

// ── 分页 ──────────────────────────────────────────────
function readPageFromRouteQuery(raw: LocationQueryValue | LocationQueryValue[] | undefined | null): number {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v == null || v === '') return 1
  const n = parseInt(String(v), 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

/** currentPage = 「锚点页」：最近一次通过分页控件/URL 定位的页；与 URL 双向同步 */
const currentPage = ref(readPageFromRouteQuery(route.query.page))
const lastSuccessfulPage = ref(1)
const failedTargetPage = ref<number | null>(null)
const skipPageWatch = ref(false)

/**
 * 当前视口所在的页码：跟随滚动实时更新，仅控制分页高亮，不触发任何请求。
 * currentPage 仍作为锚点页（导航/URL 同步）。
 */
const displayPage = ref(1)

/**
 * 每页内容的滚动阈值（到达该值则视为进入该页）。
 * key = 页码，value = 文档 scrollY 阈值（进入该页时触底前的 scrollHeight - innerHeight）。
 */
const pageScrollOffsets = new Map<number, number>()

function updateDisplayPage() {
  if (typeof window === 'undefined') return
  const midY = window.scrollY + window.innerHeight * 0.4
  let bestPage = currentPage.value
  let bestThreshold = -Infinity
  for (const [p, threshold] of pageScrollOffsets.entries()) {
    if (midY >= threshold && threshold > bestThreshold) {
      bestThreshold = threshold
      bestPage = p
    }
  }
  displayPage.value = bestPage
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / listPageSize.value)))

/**
 * 生成分页条：
 * - 总页数 ≤ maxVisible → 返回全部页码
 * - 总页数 > maxVisible → 返回 [1, 2, ..., maxVisible-1, null(省略号), totalPages]
 */
function buildPageStrip(tp: number, maxVisible: number): (number | null)[] {
  if (tp <= maxVisible) return Array.from({ length: tp }, (_, i) => i + 1)
  const strip: (number | null)[] = Array.from({ length: maxVisible - 1 }, (_, i) => i + 1)
  strip.push(null)
  strip.push(tp)
  return strip
}

/** 移动端最多 6 个页码按钮 */
const mobilePageStrip = computed(() => buildPageStrip(totalPages.value, 6))
/** 桌面端最多 10 个页码按钮 */
const desktopPageStrip = computed(() => buildPageStrip(totalPages.value, 10))

// ── Go 跳页弹窗 ───────────────────────────────────────
const goPopupOpen = ref(false)
const goInput = ref('')
const goInputRef = ref<HTMLInputElement | null>(null)

function toggleGoPopup() {
  if (goPopupOpen.value) {
    closeGoPopup()
  } else {
    goInput.value = String(displayPage.value)
    goPopupOpen.value = true
    void nextTick(() => goInputRef.value?.select())
  }
}

function closeGoPopup() {
  goPopupOpen.value = false
  goInput.value = ''
}

function submitGoJump() {
  const n = parseInt(String(goInput.value).trim(), 10)
  if (Number.isFinite(n) && n >= 1) goTo(n)
  closeGoPopup()
}

function syncListPageToUrl(page: number) {
  const cur = readPageFromRouteQuery(route.query.page)
  if (cur === page) return
  const q = { ...route.query }
  if (page <= 1) delete q.page
  else q.page = String(page)
  void router.replace({ path: route.path, query: q })
}

// ── 搜索 & 筛选 ───────────────────────────────────────
const searchKeyword = ref('')
const listStructuredFilters = reactive({
  hotLabel: '',
  wallpaperKind: '',
  classificationTag: '',
  resolutionLabel: '',
  colorTone: '',
  resolution: '',
})
const skipSearchDebounce = ref(0)

const toolbarFilterSelections = computed(() => ({
  hot: listStructuredFilters.hotLabel,
  kind: listStructuredFilters.wallpaperKind,
  category: listStructuredFilters.classificationTag,
  resolution: listStructuredFilters.resolution || listStructuredFilters.resolutionLabel,
  color: listStructuredFilters.colorTone,
}))

const pageCache = new Map<string, { items: WallpaperItem[]; total: number }>()
const MAX_CACHED_PAGES = 10

function cacheKey(page: number): string {
  const tag = searchKeyword.value.trim()
  return JSON.stringify({
    page, tag, sort: listSort.value, pageSize: listPageSize.value,
    f: { ...listStructuredFilters },
  })
}

function touchCache(page: number): boolean {
  const key = cacheKey(page)
  const hit = pageCache.get(key)
  if (!hit) return false
  pageCache.delete(key)
  pageCache.set(key, hit)
  items.value = hit.items
  total.value = hit.total
  loadedUpToPage.value = page
  lastSuccessfulPage.value = page
  failedTargetPage.value = null
  loadError.value = null
  return true
}

function putCache(page: number, newItems: WallpaperItem[], t: number) {
  const key = cacheKey(page)
  const payload = { items: newItems, total: t }
  if (pageCache.has(key)) pageCache.delete(key)
  pageCache.set(key, payload)
  while (pageCache.size > MAX_CACHED_PAGES) {
    const oldest = pageCache.keys().next().value as string | undefined
    if (oldest === undefined) break
    pageCache.delete(oldest)
  }
}

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

/**
 * 主加载：导航/搜索/筛选触发，重置 items 并加载锚点页，之后可无限滚动追加。
 * 翻页时置顶。
 */
async function load() {
  const seq = ++loadSeq
  const requested = currentPage.value

  if (touchCache(requested)) {
    loading.value = false
    pageScrollOffsets.clear()
    pageScrollOffsets.set(requested, 0)
    displayPage.value = requested
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  loading.value = true
  loadError.value = null
  failedTargetPage.value = null
  try {
    let { items: chunk, total: t } = await fetchMobileWallpapersPage(buildFetchQuery(requested))
    if (seq !== loadSeq) return

    const tp = Math.max(1, Math.ceil(t / listPageSize.value))
    let cachePage = requested

    if (requested > tp && tp > 0) {
      skipPageWatch.value = true
      try {
        currentPage.value = tp
        const second = await fetchMobileWallpapersPage(buildFetchQuery(tp))
        if (seq !== loadSeq) return
        chunk = second.items
        t = second.total
        cachePage = tp
      } finally {
        skipPageWatch.value = false
        syncListPageToUrl(currentPage.value)
      }
    }

    if (seq !== loadSeq) return

    items.value = chunk
    total.value = t
    loadedUpToPage.value = cachePage
    lastSuccessfulPage.value = cachePage
    putCache(cachePage, chunk, t)
    // 重置滚动阈值表：锚点页从顶部（阈值 0）开始
    pageScrollOffsets.clear()
    pageScrollOffsets.set(cachePage, 0)
    displayPage.value = cachePage
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    if (seq !== loadSeq) return
    const msg = e instanceof Error ? e.message : '加载失败'
    loadError.value = msg
    failedTargetPage.value = requested
    skipPageWatch.value = true
    currentPage.value = lastSuccessfulPage.value
    skipPageWatch.value = false
    syncListPageToUrl(lastSuccessfulPage.value)
  } finally {
    if (seq === loadSeq) loading.value = false
  }
}

/** 无限滚动：追加下一页（不重置 items，不置顶，不改变 currentPage）。 */
async function onLoadMore() {
  if (!hasMore.value || loadingMore.value || loading.value) return
  const nextPage = loadedUpToPage.value + 1

  // 在追加前记录「该页内容首次可见」的滚动阈值（≈ 当前文档底部）
  const pageThreshold = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

  // 缓存命中则直接追加
  const cached = pageCache.get(cacheKey(nextPage))
  if (cached) {
    items.value = [...items.value, ...cached.items]
    total.value = cached.total
    loadedUpToPage.value = nextPage
    pageScrollOffsets.set(nextPage, pageThreshold)
    return
  }

  loadingMore.value = true
  try {
    const { items: chunk, total: t } = await fetchMobileWallpapersPage(buildFetchQuery(nextPage))
    items.value = [...items.value, ...chunk]
    total.value = t
    loadedUpToPage.value = nextPage
    pageScrollOffsets.set(nextPage, pageThreshold)
    putCache(nextPage, chunk, t)
  } catch {
    // 静默失败，避免打断浏览
  } finally {
    loadingMore.value = false
  }
}

function retryLoad() {
  loadError.value = null
  const target = failedTargetPage.value
  failedTargetPage.value = null
  if (target != null && target !== currentPage.value) {
    currentPage.value = target
    return
  }
  void load()
}

function goTo(page: number) {
  const next = Math.min(totalPages.value, Math.max(1, page))
  if (next === currentPage.value) return
  currentPage.value = next
}

// ── 搜索事件处理 ──────────────────────────────────────
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

function onSearchSubmit(kw?: string) {
  if (kw !== undefined) searchKeyword.value = kw
  listPageSize.value = DEFAULT_MOBILE_WALLPAPER_PAGE_SIZE
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
    listPageSize.value = DEFAULT_MOBILE_WALLPAPER_PAGE_SIZE
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
  listPageSize.value = DEFAULT_MOBILE_WALLPAPER_PAGE_SIZE
  debouncedTagSearch.cancel()
  if (id === 'hot') { listStructuredFilters.hotLabel = ''; listSort.value = DEFAULT_MOBILE_WALLPAPER_SORT }
  else if (id === 'kind') listStructuredFilters.wallpaperKind = ''
  else if (id === 'category') listStructuredFilters.classificationTag = ''
  else if (id === 'resolution') { listStructuredFilters.resolutionLabel = ''; listStructuredFilters.resolution = '' }
  else if (id === 'color') listStructuredFilters.colorTone = ''
  pageCache.clear()
  if (currentPage.value === 1) void load()
  else currentPage.value = 1
}

function onFilterSelect(payload: { id: string; value: string }) {
  listPageSize.value = DEFAULT_MOBILE_WALLPAPER_PAGE_SIZE
  debouncedTagSearch.cancel()
  const v = payload.value.trim()
  if (payload.id === 'hot') {
    const sortByLabel: Record<string, string> = {
      最新: '-createdAt', 推荐的: '-score', 昨日热门: '-hotYesterday',
      近三天热门: '-hot3d', 上周热门: '-hotWeek', 上月热门: '-hotMonth', 近3月热门: '-hot3m',
    }
    listSort.value = sortByLabel[v] ?? DEFAULT_MOBILE_WALLPAPER_SORT
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

function onVisualSearchPlaceholder() { /* 以图搜图占位 */ }

// ── 分页 watch ────────────────────────────────────────
watch(
  currentPage,
  (page) => {
    if (skipPageWatch.value) return
    syncListPageToUrl(page)
    void load()
  },
  { immediate: true },
)

watch(() => route.query.page, () => {
  const n = readPageFromRouteQuery(route.query.page)
  if (n === currentPage.value) return
  skipPageWatch.value = true
  currentPage.value = n
  skipPageWatch.value = false
  void load()
})

// ── dock 吸底 ─────────────────────────────────────────
const dockWrapRef = ref<HTMLElement | null>(null)
const dockPinned = ref(false)
const dockSpacerHeight = ref(0)
let dockResizeObserver: ResizeObserver | null = null

function updateDockPinned() {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  const slackPx = 56
  const y = window.scrollY + window.innerHeight
  dockPinned.value = y < root.scrollHeight - slackPx
}

const { onResize: debouncedDockResize, cancel: cancelDebouncedDockResize } = createDebouncedWindowResize(
  updateDockPinned,
  VIEWPORT_RESIZE_DEBOUNCE_MS,
)

const debouncedDockSpacerMeasure = debounce(() => {
  if (dockWrapRef.value) dockSpacerHeight.value = dockWrapRef.value.offsetHeight
}, VIEWPORT_RESIZE_DEBOUNCE_MS)

/** 首次加载 / 搜索重置时显示全屏骨架 */
const showFullSkeleton = computed(() => loading.value && items.value.length === 0)
/** 分页跳转时，旧内容上叠加半透明骨架遮罩；无限滚动追加由 WallpaperMasonry 自身处理 */
const showFetchOverlay = computed(() => loading.value && items.value.length > 0)

watch([() => items.value.length, () => loading.value, totalPages], () => {
  void nextTick(() => updateDockPinned())
})

// ── 返回顶部 ──────────────────────────────────────────
const showBackToTop = ref(false)

function updateBackToTopVisibility() {
  if (typeof window === 'undefined') return
  showBackToTop.value = window.scrollY > 240
}

function onScroll() {
  updateDockPinned()
  updateBackToTopVisibility()
  updateDisplayPage()
}

function scrollToTop() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── 跳转详情 ──────────────────────────────────────────
function onTileClick(item: WallpaperItem) {
  cacheWallpaperForDetail({ ...item, kind: 'mobile' })
  router.push({
    name: ROUTE_NAME_WALLPAPER_DETAIL,
    params: { id: String(item.id) },
    query: { kind: 'mobile' },
  })
}

// ── 生命周期 ──────────────────────────────────────────
onMounted(() => {
  updateMasonryColumns()
  const mq = window.matchMedia('(min-width: 900px)')
  const onMq = () => { updateMasonryColumns(); updateDockPinned() }
  mq.addEventListener('change', onMq)
  masonryMqCleanup = () => mq.removeEventListener('change', onMq)

  updateDockPinned()
  updateBackToTopVisibility()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', debouncedDockResize, { passive: true })

  void nextTick(() => {
    const el = dockWrapRef.value
    if (!el || typeof ResizeObserver === 'undefined') return
    dockResizeObserver = new ResizeObserver(() => { debouncedDockSpacerMeasure() })
    dockResizeObserver.observe(el)
    dockSpacerHeight.value = el.offsetHeight
  })
})

onBeforeUnmount(() => {
  debouncedTagSearch.cancel()
  debouncedDockSpacerMeasure.cancel()
  cancelDebouncedDockResize()
  masonryMqCleanup?.()
  masonryMqCleanup = undefined
  dockResizeObserver?.disconnect()
  dockResizeObserver = null
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', debouncedDockResize)
  }
})
</script>

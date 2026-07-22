<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="!isLoading && handleClose()"
      >
        <div
          class="absolute inset-0 backdrop-blur-md"
          :class="themeLight ? 'bg-black/40' : 'bg-black/80'"
        />
        <div
          class="relative w-full max-w-3xl overflow-hidden rounded-3xl border shadow-2xl"
          :class="
            themeLight
              ? 'border-slate-200 bg-white'
              : 'border-white/10 bg-gradient-to-br from-gray-900/95 to-gray-800/95'
          "
        >
          <!-- 头部 -->
          <div
            class="flex items-center justify-between border-b px-3 sm:px-4 py-2.5 sm:py-3"
            :class="themeLight ? 'border-slate-200' : 'border-white/10'"
          >
            <div class="flex items-center gap-1.5 sm:gap-2">
              <div
                class="flex h-5 sm:h-6 w-5 sm:w-6 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
              >
                <svg
                  class="h-3 sm:h-3.5 w-3 sm:w-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <span
                class="text-xs sm:text-sm font-semibold"
                :class="themeLight ? 'text-slate-800' : 'text-white'"
                >{{ cropTitle }}</span
              >
            </div>
            <button
              type="button"
              class="rounded-xl p-1 sm:p-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent"
              :class="themeLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'"
              :disabled="isLoading"
              @click="handleClose"
            >
              <svg
                class="h-3.5 sm:h-4 w-3.5 sm:w-4 transition-colors"
                :class="
                  themeLight
                    ? 'text-slate-500 hover:text-slate-700'
                    : 'text-white/60 hover:text-white'
                "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- 主体 -->
          <div class="p-1 pb-6">
            <!-- 上传区域 -->
            <div
              v-if="!imageSrc"
              class="group relative flex h-40 sm:h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10"
              :class="
                themeLight
                  ? 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                  : 'border-white/20 bg-gradient-to-br from-white/5 to-transparent hover:bg-white/10'
              "
            >
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 cursor-pointer opacity-0"
                @change="handleFileSelect"
              />
              <div class="relative">
                <div
                  class="absolute inset-0 blur-xl bg-gradient-to-r from-blue-500/30 to-purple-500/30 transition-opacity group-hover:opacity-100"
                />
                <svg
                  class="relative mb-2 sm:mb-3 h-8 sm:h-10 w-8 sm:w-10 transition-colors"
                  :class="
                    themeLight
                      ? 'text-slate-400 group-hover:text-blue-500'
                      : 'text-white/60 group-hover:text-white'
                  "
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <span
                class="text-xs sm:text-sm font-medium transition-colors"
                :class="
                  themeLight
                    ? 'text-slate-700 group-hover:text-blue-600'
                    : 'text-white/80 group-hover:text-white'
                "
                >点击或拖拽上传图片</span
              >
              <span
                class="mt-1 sm:mt-1.5 text-[10px] sm:text-xs"
                :class="themeLight ? 'text-slate-400' : 'text-white/40'"
                >支持 JPG、PNG 格式</span
              >
            </div>

            <!-- 裁剪区域 -->
            <div v-else class="flex flex-col gap-5">
              <div
                ref="cropContainer"
                class="crop-container relative overflow-hidden rounded-2xl bg-black shadow-lg"
                :style="{ aspectRatio: `${containerAspectRatio}` }"
                :class="{ 'pointer-events-none': isLoading }"
                @mousedown="startDrag"
                @touchstart="startTouchDrag"
              >
                <div class="absolute inset-0 overflow-hidden">
                  <img
                    :src="imageSrc"
                    class="absolute crop-image"
                    :style="reactiveImageStyle"
                  />
                </div>
                <!-- 上传中遮罩 -->
                <div
                  v-if="isLoading"
                  class="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                  <div class="flex flex-col items-center gap-3">
                    <svg
                      class="h-8 w-8 animate-spin text-blue-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span class="text-sm text-white/80">上传中...</span>
                  </div>
                </div>
                <!-- 裁剪框遮罩 -->
                <div class="absolute inset-0 pointer-events-none">
                  <div class="absolute inset-0 bg-black/60" />
                  <div
                    class="absolute left-0 top-0 h-full w-4 sm:w-6 bg-black/40"
                  />
                  <div
                    class="absolute right-0 top-0 h-full w-4 sm:w-6 bg-black/40"
                  />
                  <div
                    class="absolute inset-x-4 sm:inset-x-6 top-0 h-4 sm:h-6 bg-black/40"
                  />
                  <div
                    class="absolute inset-x-4 sm:inset-x-6 bottom-0 h-4 sm:h-6 bg-black/40"
                  />
                </div>
                <!-- 裁剪框边框 -->
                <div
                  class="absolute left-4 sm:left-6 top-4 sm:top-6 h-[calc(100%-32px)] sm:h-[calc(100%-48px)] w-[calc(100%-32px)] sm:w-[calc(100%-48px)] pointer-events-none"
                >
                  <!-- 边框线 -->
                  <div class="absolute inset-0 border-2 border-white/70" />
                  <!-- 四角 -->
                  <div
                    class="absolute -left-1.5 sm:-left-2 -top-1.5 sm:-top-2 h-4 sm:h-6 w-4 sm:w-6 border-l-2 border-t-2 border-white/90"
                  />
                  <div
                    class="absolute -right-1.5 sm:-right-2 -top-1.5 sm:-top-2 h-4 sm:h-6 w-4 sm:w-6 border-r-2 border-t-2 border-white/90"
                  />
                  <div
                    class="absolute -bottom-1.5 sm:-bottom-2 -left-1.5 sm:-left-2 h-4 sm:h-6 w-4 sm:w-6 border-b-2 border-l-2 border-white/90"
                  />
                  <div
                    class="absolute -bottom-1.5 sm:-bottom-2 -right-1.5 sm:-right-2 h-4 sm:h-6 w-4 sm:w-6 border-b-2 border-r-2 border-white/90"
                  />
                  <!-- 四角内部填充 -->
                  <div
                    class="absolute -left-1 sm:-left-1.5 -top-1 sm:-top-1.5 h-3 sm:h-4 w-3 sm:w-4 bg-white/10"
                  />
                  <div
                    class="absolute -right-1 sm:-right-1.5 -top-1 sm:-top-1.5 h-3 sm:h-4 w-3 sm:w-4 bg-white/10"
                  />
                  <div
                    class="absolute -bottom-1 sm:-bottom-1.5 -left-1 sm:-left-1.5 h-3 sm:h-4 w-3 sm:w-4 bg-white/10"
                  />
                  <div
                    class="absolute -bottom-1 sm:-bottom-1.5 -right-1 sm:-right-1.5 h-3 sm:h-4 w-3 sm:w-4 bg-white/10"
                  />
                </div>
                <!-- 拖拽提示 -->
                <div
                  class="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white/60 backdrop-blur-sm pointer-events-none"
                >
                  拖拽调整位置
                </div>
              </div>

              <!-- 控制栏 -->
              <div
                v-if="isNarrowViewport"
                class="flex flex-col items-center gap-3 w-full"
              >
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    class="flex items-center gap-0.5 rounded-xl border px-2 py-1.5 text-[10px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    :class="
                      themeLight
                        ? 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                    "
                    :disabled="isLoading"
                    @click="rotate(-90)"
                  >
                    <svg
                      t="1784640095854"
                      class="icon"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="5399"
                      width="10"
                      height="10"
                      :fill="themeLight ? '#6b7280' : '#cdcdcd'"
                    >
                      <path
                        d="M649.9356942 327.16885003l0 502.2110636 269.4506878 0L649.9356942 327.16885003zM619.97687786 829.37991363L619.97687786 563.46230215 110.99422865 829.37991363 619.97687786 829.37991363zM515.77290548 380.72798983l-117.25387097-26.67673299c0 0 83.05605935-185.14314867 297.66388221-84.17942806 0 0-167.36447056-211.73708887-414.91862441 57.54801335l-117.25387097-26.63402929 135.24606749 212.98421073L515.77290548 380.72798983z"
                        p-id="5400"
                      ></path>
                    </svg>
                    左旋转
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-0.5 rounded-xl border px-2 py-1.5 text-[10px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    :class="
                      themeLight
                        ? 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                    "
                    :disabled="isLoading"
                    @click="rotate(90)"
                  >
                    <svg
                      t="1784640183464"
                      class="icon"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="9003"
                      width="10"
                      height="10"
                      :fill="themeLight ? '#6b7280' : '#dbdbdb'"
                    >
                      <path
                        d="M34.883997 883.639229l316.384787 0L351.268784 293.950845 34.883997 883.639229zM984.08543 883.639229 386.445958 571.402925l0 312.236304L984.08543 883.639229zM763.029802 513.054005l158.804842-250.082732L784.156982 294.244534C493.482763-21.945825 296.966017 226.672556 296.966017 226.672556c251.989151-118.550023 349.512279 98.842169 349.512279 98.842169l-137.677663 31.323403L763.029802 513.054005z"
                        p-id="9004"
                      ></path>
                    </svg>
                    右旋转
                  </button>
                </div>
                <div class="flex items-center justify-center gap-2 w-full">
                  <ElasticSlider
                    :default-value="Math.round(scale * 100)"
                    :starting-value="100"
                    :max-value="300"
                    :is-stepped="true"
                    :step-size="10"
                    :class-name="
                      themeLight ? 'text-slate-600' : 'text-white/70'
                    "
                    :compact="true"
                    @update="handleScaleUpdate"
                  />
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      class="flex items-center gap-0.5 rounded-xl border px-2 py-1.5 text-[10px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      :class="
                        themeLight
                          ? 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                          : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                      "
                      :disabled="isLoading"
                      @click="resetImage"
                    >
                      <svg
                        class="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
                        />
                        <path d="M21 3v5h-5" />
                        <path
                          d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
                        />
                        <path d="M8 16H3v5" />
                      </svg>
                      重置
                    </button>
                    <button
                      type="button"
                      class="flex items-center gap-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 text-[10px] font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      :disabled="isLoading"
                      @click="handleConfirm"
                    >
                      <svg
                        v-if="isLoading"
                        class="h-3 w-3 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        />
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <svg
                        v-else
                        class="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {{ isLoading ? "上传中" : "上传" }}
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="flex flex-row items-center justify-between gap-3 w-full"
              >
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-xl border px-3 py-2 text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    :class="
                      themeLight
                        ? 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                    "
                    :disabled="isLoading"
                    @click="rotate(-90)"
                  >
                    <svg
                      t="1784640095854"
                      class="icon"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="5399"
                      width="14"
                      height="14"
                      :fill="themeLight ? '#6b7280' : '#cdcdcd'"
                    >
                      <path
                        d="M649.9356942 327.16885003l0 502.2110636 269.4506878 0L649.9356942 327.16885003zM619.97687786 829.37991363L619.97687786 563.46230215 110.99422865 829.37991363 619.97687786 829.37991363zM515.77290548 380.72798983l-117.25387097-26.67673299c0 0 83.05605935-185.14314867 297.66388221-84.17942806 0 0-167.36447056-211.73708887-414.91862441 57.54801335l-117.25387097-26.63402929 135.24606749 212.98421073L515.77290548 380.72798983z"
                        p-id="5400"
                      ></path>
                    </svg>
                    左旋转
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-xl border px-3 py-2 text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    :class="
                      themeLight
                        ? 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                    "
                    :disabled="isLoading"
                    @click="rotate(90)"
                  >
                    <svg
                      t="1784640183464"
                      class="icon"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="9003"
                      width="14"
                      height="14"
                      :fill="themeLight ? '#6b7280' : '#dbdbdb'"
                    >
                      <path
                        d="M34.883997 883.639229l316.384787 0L351.268784 293.950845 34.883997 883.639229zM984.08543 883.639229 386.445958 571.402925l0 312.236304L984.08543 883.639229zM763.029802 513.054005l158.804842-250.082732L784.156982 294.244534C493.482763-21.945825 296.966017 226.672556 296.966017 226.672556c251.989151-118.550023 349.512279 98.842169 349.512279 98.842169l-137.677663 31.323403L763.029802 513.054005z"
                        p-id="9004"
                      ></path>
                    </svg>
                    右旋转
                  </button>
                </div>
                <div class="flex items-center justify-center">
                  <ElasticSlider
                    :default-value="Math.round(scale * 100)"
                    :starting-value="100"
                    :max-value="300"
                    :is-stepped="true"
                    :step-size="10"
                    :class-name="
                      themeLight ? 'text-slate-600' : 'text-white/70'
                    "
                    :compact="false"
                    @update="handleScaleUpdate"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-xl border px-3 py-2 text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    :class="
                      themeLight
                        ? 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                    "
                    :disabled="isLoading"
                    @click="resetImage"
                  >
                    <svg
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
                      />
                      <path d="M21 3v5h-5" />
                      <path
                        d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
                      />
                      <path d="M8 16H3v5" />
                    </svg>
                    重置
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    :disabled="isLoading"
                    @click="handleConfirm"
                  >
                    <svg
                      v-if="isLoading"
                      class="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {{ isLoading ? "上传中" : "上传" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  onUnmounted,
  computed,
  nextTick,
  inject,
  type Ref,
} from "vue";
import ElasticSlider from "./ElasticSlider.vue";

const props = defineProps<{
  visible: boolean;
  aspectRatio?: number;
  title?: string;
  fitMode?: "width" | "cover";
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", blob: Blob): void;
}>();

const isLoading = computed(() => !!props.loading);

const appThemeLight = inject<Ref<boolean> | undefined>(
  "appThemeLight",
  undefined,
);
const themeLight = computed(() => appThemeLight?.value === true);

const imageSrc = ref("");
const position = ref({ x: 0, y: 0 });
const scale = ref(1);
const rotation = ref(0);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const cropContainer = ref<HTMLDivElement | null>(null);
const imageSize = ref({ width: 0, height: 0 });
const containerSize = ref({ width: 0, height: 0 });
let resizeObserver: ResizeObserver | null = null;

const cropTitle = computed(() => props.title || "上传背景图");

const isNarrowViewport = ref(false);

function updateViewport() {
  isNarrowViewport.value = window.innerWidth < 640;
}

const containerAspectRatio = computed(() => props.aspectRatio || 16 / 9);

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      updateViewport();
      nextTick(() => {
        if (cropContainer.value) {
          const rect = cropContainer.value.getBoundingClientRect();
          containerSize.value = { width: rect.width, height: rect.height };
        }
        if (imageSize.value.width > 0) {
          resetImage();
        }
        if (cropContainer.value) {
          resizeObserver = new ResizeObserver(() => {
            if (cropContainer.value) {
              const rect = cropContainer.value.getBoundingClientRect();
              containerSize.value = { width: rect.width, height: rect.height };
            }
            if (imageSize.value.width > 0) {
              position.value = { x: 0, y: 0 };
            }
          });
          resizeObserver.observe(cropContainer.value);
        }
        window.addEventListener("resize", handleWindowResize);
      });
    } else {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      window.removeEventListener("resize", handleWindowResize);
    }
  },
);

function handleWindowResize() {
  updateViewport();
  if (cropContainer.value && imageSize.value.width > 0) {
    const rect = cropContainer.value.getBoundingClientRect();
    containerSize.value = { width: rect.width, height: rect.height };
    position.value = { x: 0, y: 0 };
  }
}

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  window.removeEventListener("resize", handleWindowResize);
});

watch(
  () => props.fitMode,
  () => {
    if (props.visible && imageSize.value.width > 0) {
      nextTick(() => {
        resetImage();
      });
    }
  },
);

watch(imageSize, () => {
  if (props.visible && imageSize.value.width > 0) {
    nextTick(() => {
      resetImage();
    });
  }
});

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    loadImage(file);
  }
}

function loadImage(file: File) {
  // 直接用 object URL 加载原图，不再压缩
  // （已改用 Blob 上传，无需为 base64 卡顿做预压缩）
  const url = URL.createObjectURL(file);
  imageSrc.value = url;
  const img = new Image();
  img.onload = () => {
    imageSize.value = { width: img.width, height: img.height };
    resetImage();
  };
  img.src = url;
}

function getBaseDisplaySize() {
  if (!imageSize.value.width) {
    return { width: 0, height: 0 };
  }

  const containerWidth =
    containerSize.value.width ||
    cropContainer.value?.getBoundingClientRect().width ||
    0;
  const containerHeight =
    containerSize.value.height ||
    cropContainer.value?.getBoundingClientRect().height ||
    0;

  if (containerWidth === 0) {
    return { width: 0, height: 0 };
  }

  const imgWidth = imageSize.value.width;
  const imgHeight = imageSize.value.height;
  const imgRatio = imgWidth / imgHeight;

  const rotationAngle = ((rotation.value % 360) + 360) % 360;
  const isRotated = rotationAngle === 90 || rotationAngle === 270;

  const visualRatio = isRotated ? imgHeight / imgWidth : imgRatio;

  let visualWidth: number;
  let visualHeight: number;

  const currentFitMode = props.fitMode || "width";

  if (currentFitMode === "cover") {
    const containerRatio = containerWidth / containerHeight;
    if (visualRatio > containerRatio) {
      visualHeight = containerHeight;
      visualWidth = containerHeight * visualRatio;
    } else {
      visualWidth = containerWidth;
      visualHeight = containerWidth / visualRatio;
    }
  } else {
    visualWidth = containerWidth;
    visualHeight = containerWidth / visualRatio;
  }

  let displayWidth: number;
  let displayHeight: number;

  if (isRotated) {
    displayWidth = visualHeight;
    displayHeight = visualWidth;
  } else {
    displayWidth = visualWidth;
    displayHeight = visualHeight;
  }

  return { width: displayWidth, height: displayHeight };
}

function getImageStyle() {
  const { width: displayWidth, height: displayHeight } = getBaseDisplaySize();

  if (displayWidth === 0) {
    return {
      transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value}) rotate(${rotation.value}deg)`,
      transformOrigin: "center center",
    };
  }

  return {
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    left: "50%",
    top: "50%",
    transform: `translate(calc(-50% + ${position.value.x}px), calc(-50% + ${position.value.y}px)) scale(${scale.value}) rotate(${rotation.value}deg)`,
  };
}

// 响应式图片样式：容器尺寸变化时自动重新计算
const reactiveImageStyle = computed(() => {
  return getImageStyle();
});

function resetImage() {
  position.value = { x: 0, y: 0 };
  scale.value = 1;
  rotation.value = 0;
}

function getVisualSize() {
  const { width: displayWidth, height: displayHeight } = getBaseDisplaySize();
  const rotationAngle = ((rotation.value % 360) + 360) % 360;
  if (rotationAngle === 90 || rotationAngle === 270) {
    return { width: displayHeight, height: displayWidth };
  }
  return { width: displayWidth, height: displayHeight };
}

function screenToRotatedCoords(x: number, y: number) {
  const rotationAngle = ((rotation.value % 360) + 360) % 360;
  switch (rotationAngle) {
    case 90:
      return { x: y, y: -x };
    case 180:
      return { x: -x, y: -y };
    case 270:
      return { x: -y, y: x };
    default:
      return { x, y };
  }
}

function startDrag(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true;
  dragStart.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y,
  };
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("mouseleave", stopDrag);
}

function onDrag(event: MouseEvent) {
  if (!isDragging.value) return;
  event.preventDefault();

  const newX = event.clientX - dragStart.value.x;
  const newY = event.clientY - dragStart.value.y;

  if (
    cropContainer.value &&
    imageSize.value.width > 0 &&
    imageSize.value.height > 0
  ) {
    const containerRect = cropContainer.value.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const { width: visualWidth, height: visualHeight } = getVisualSize();
    const scaledWidth = visualWidth * scale.value;
    const scaledHeight = visualHeight * scale.value;

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const minX = -maxX;
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);
    const minY = -maxY;

    position.value = {
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY)),
    };
  } else {
    position.value = { x: newX, y: newY };
  }
}

function stopDrag() {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("mouseleave", stopDrag);
}

// 移动端触摸拖拽：阻止冒泡避免触发外层滚动条
function startTouchDrag(event: TouchEvent) {
  if (event.touches.length !== 1) return;
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true;
  const touch = event.touches[0];
  dragStart.value = {
    x: touch.clientX - position.value.x,
    y: touch.clientY - position.value.y,
  };
  document.addEventListener("touchmove", onTouchDrag, { passive: false });
  document.addEventListener("touchend", stopTouchDrag);
  document.addEventListener("touchcancel", stopTouchDrag);
}

function onTouchDrag(event: TouchEvent) {
  if (!isDragging.value || event.touches.length !== 1) return;
  event.preventDefault();
  event.stopPropagation();
  const touch = event.touches[0];

  const newX = touch.clientX - dragStart.value.x;
  const newY = touch.clientY - dragStart.value.y;

  if (
    cropContainer.value &&
    imageSize.value.width > 0 &&
    imageSize.value.height > 0
  ) {
    const containerRect = cropContainer.value.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const { width: visualWidth, height: visualHeight } = getVisualSize();
    const scaledWidth = visualWidth * scale.value;
    const scaledHeight = visualHeight * scale.value;

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const minX = -maxX;
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);
    const minY = -maxY;

    position.value = {
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY)),
    };
  } else {
    position.value = { x: newX, y: newY };
  }
}

function stopTouchDrag() {
  isDragging.value = false;
  document.removeEventListener("touchmove", onTouchDrag);
  document.removeEventListener("touchend", stopTouchDrag);
  document.removeEventListener("touchcancel", stopTouchDrag);
}

function rotate(deg: number) {
  rotation.value += deg;
  position.value = { x: 0, y: 0 };
}

function handleScaleUpdate(val: number) {
  scale.value = val / 100;
}

function handleClose() {
  emit("close");
}

function handleConfirm() {
  if (!imageSrc.value || !cropContainer.value || imageSize.value.width === 0)
    return;

  const img = new Image();
  img.onload = () => {
    const containerRect = cropContainer.value!.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const cropMargin = 24;

    // 裁剪框在屏幕坐标系中的尺寸（CSS 像素）
    const cropBoxWidth = containerWidth - cropMargin * 2;
    const cropBoxHeight = containerHeight - cropMargin * 2;

    const { width: displayWidth, height: displayHeight } = getBaseDisplaySize();

    const scaledWidth = displayWidth * scale.value;
    const scaledHeight = displayHeight * scale.value;

    // 关键：按原图分辨率输出，避免用屏幕 CSS 像素导致缩小模糊
    // 原图到基础显示尺寸的比例（displayWidth 是按宽度铺满容器的基准尺寸）
    const sourceScale = img.width / displayWidth;

    // 输出 canvas 用原图分辨率（裁剪框对应的原图像素）
    const outputWidth = Math.round(cropBoxWidth * sourceScale);
    const outputHeight = Math.round(cropBoxHeight * sourceScale);

    const radians = (rotation.value * Math.PI) / 180;

    const outputCanvas = document.createElement("canvas");
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    // 高质量插值
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.translate(outputWidth / 2, outputHeight / 2);
    ctx.rotate(radians);

    const rotatedPos = screenToRotatedCoords(position.value.x, position.value.y);
    const drawX = (-scaledWidth / 2 + rotatedPos.x) * sourceScale;
    const drawY = (-scaledHeight / 2 + rotatedPos.y) * sourceScale;
    const drawW = scaledWidth * sourceScale;
    const drawH = scaledHeight * sourceScale;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    ctx.restore();

    // 用 toBlob 输出二进制，质量 0.92 保证清晰度
    outputCanvas.toBlob(
      (blob) => {
        if (blob) {
          emit("confirm", blob);
        }
      },
      "image/jpeg",
      0.92,
    );
  };
  img.src = imageSrc.value;
}

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      // 清理 object URL 避免内存泄漏
      if (imageSrc.value.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc.value);
      }
      imageSrc.value = "";
      resetImage();
      stopDrag();
      stopTouchDrag();
    }
  },
);

onUnmounted(() => {
  if (imageSrc.value.startsWith("blob:")) {
    URL.revokeObjectURL(imageSrc.value);
  }
  stopDrag();
  stopTouchDrag();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .relative,
.fade-leave-to .relative {
  transform: scale(0.95) translateY(20px);
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
  transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
}

:deep(.crop-image) {
  max-width: none !important;
  max-height: none !important;
}

.crop-container {
  touch-action: none;
}
</style>

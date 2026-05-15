<template>
  <div
    class="mac-stage relative h-full w-full"
    :style="{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }"
  >
    <div
      class="absolute inset-0 flex flex-col items-center justify-center"
      style="padding-bottom: 1.5%"
    >
      <div class="mac-laptop flex w-full flex-col items-center">
        <div class="mac-bezel relative bg-black">

          <div class="mac-screen-inner">
            <!-- Loading 状态背景 -->
            <div 
              v-if="imageLoading" 
              class="absolute inset-0 flex items-center justify-center bg-[#2a2d36]"
            >
              <WaveLoader />
            </div>

            <!-- 图片内容 -->
            <img
              v-if="imageUrl"
              :src="imageUrl"
              alt=""
              class="mac-wallpaper"
              :class="{ 'opacity-0': imageLoading }"
              draggable="false"
              @load="handleImageLoad"
              @error="handleImageError"
            />

            <!-- 空状态/错误状态 -->
            <div 
              v-if="(!imageUrl || imageError) && !imageLoading" 
              class="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#2a2d36]"
            >
              <svg class="h-20 w-20 text-white/15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
              <span class="text-xs text-white/30">{{ imageError ? '加载失败' : '无预览图' }}</span>
            </div>
          </div>
        </div>

        <div class="mac-hinge" aria-hidden="true">
          <div class="mac-hinge-notch" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import WaveLoader from '../WaveLoader.vue'

const props = defineProps<{
  imageUrl: string
}>()

const STAGE_W = 1150
const STAGE_H = 600

const imageLoading = ref(true)
const imageError = ref(false)

// 监听 imageUrl 变化，重置加载状态
watch(() => props.imageUrl, () => {
  if (props.imageUrl) {
    imageLoading.value = true
    imageError.value = false
  } else {
    imageLoading.value = false
    imageError.value = false
  }
}, { immediate: true })

function handleImageLoad() {
  imageLoading.value = false
  imageError.value = false
}

function handleImageError() {
  imageLoading.value = false
  imageError.value = true
}
</script>

<style scoped>
/* 以 1150×600 为设计基准，容器缩小时等比缩放 */
.mac-stage {
  container-type: inline-size;
}

@media (min-width: 900px) {
  .mac-stage {
    margin-left: 100px;
  }
}

/* 设计基准：壁纸展示区 850×550 */
.mac-laptop {
  width: min(100%, 1300px);
}

.mac-bezel {
  width: 100%;
  border-radius: 20px 20px 0 0;
  border: 4px solid #c0c0c0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 固定 16:9 视口；非 1920×1080 的图片用 cover 居中裁切以撑满 */
.mac-screen-inner {
  position: relative;
  z-index: 1;
  aspect-ratio: 1920 / 1080;
  width: calc(100% - 5px);
  overflow: hidden;
  border-radius: 15px 15px 0 0;
  margin-top: 5px;
  margin-bottom: 10px;
  background: #0c0c0e;
}

.mac-wallpaper {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 0.3s ease;
}


.mac-hinge {
  margin-top: -2px;
  width: 120%;
  height: 10px;
  border-radius: 0 0 20px 20px;
  z-index: 2;
  background: linear-gradient(to bottom, #f0f0f2 0%, #b9bcc2 38%, #7f848e 100%);
  position: relative;
  /* 立体感：上沿高光 + 下沿压暗 */
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.55) inset,
    0 -1px 0 rgba(0, 0, 0, 0.35) inset;
}

.mac-hinge::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.mac-hinge-notch {
  position: absolute;
  left: 50%;
  top: -2px;
  z-index: 3;
  transform: translate(-50%, -2px);
  /* 槽位比例跟随容器缩放 */
  width: clamp(96px, 12cqw, 140px);
  height: clamp(6px, 0.7cqw, 7px);
  border-radius: 0 0 10px 10px;
  background: linear-gradient(to bottom, #050607 0%, #0b0c0e 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}

@media (max-width: 640px) {
  .mac-bezel {
    border-radius: 18px;
  }

  .mac-screen-inner {
    border-radius: 15px;
  }

  .mac-hinge {
    height: 6px;
  }

  .mac-hinge-notch {
    border-radius: 0 0 8px 8px;
    transform: translate(-50%, -1px);
  }
}

</style>

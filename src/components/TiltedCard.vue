<template>
  <figure
    ref="cardRef"
    class="relative flex h-full w-full min-h-0 flex-col items-center justify-center [perspective:800px]"
    :style="{
      height: containerHeight,
      width: containerWidth,
    }"
    @mousemove="handleMouse"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div v-if="showMobileWarning" class="absolute top-2 z-[1] block text-center text-xs sm:hidden" :class="hintClass">
      倾斜效果在桌面端体验更佳。
    </div>

    <Motion
      class="relative h-full w-full overflow-hidden rounded-[15px] [transform-style:preserve-3d]"
      :class="imageFit === 'contain' ? (lightTheme ? 'bg-slate-200/55' : 'bg-black/40') : ''"
      :style="{
        width: imageWidth,
        height: imageHeight,
      }"
      :animate="{
        rotateX: rotateXValue,
        rotateY: rotateYValue,
        scale: scaleValue,
      }"
      :transition="springTransition"
    >
      <img
        v-if="imageSrc"
        :src="imageSrc"
        :alt="altText"
        loading="lazy"
        decoding="async"
        class="absolute left-0 top-0 rounded-[15px] will-change-transform [transform:translateZ(0)]"
        :class="imageFit === 'contain' ? 'object-contain' : 'object-cover'"
        :style="{
          width: imageWidth,
          height: imageHeight,
        }"
      />
      <div
        v-else
        class="absolute left-0 top-0 flex items-center justify-center rounded-[15px] will-change-transform [transform:translateZ(0)]"
        :class="placeholderClass"
        :style="{
          width: imageWidth,
          height: imageHeight,
        }"
      >
        <span class="text-[10px] tracking-widest" :class="placeholderLabelClass">400×300</span>
      </div>

      <!-- 悬停自下而上滑入；玻璃层 rgba 由 slot 内组件控制为 bg-black/30 -->
      <div
        v-if="displayOverlayContent && $slots.overlay"
        class="pointer-events-none absolute left-0 top-0 z-[2] h-full w-full overflow-hidden will-change-transform [transform:translateZ(32px)]"
      >
        <div
          class="absolute inset-[0px] flex min-h-0 max-h-full flex-col transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform max-[899px]:inset-[3px]"
          :class="[
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
            isHovered ? 'pointer-events-auto' : 'pointer-events-none',
          ]"
        >
          <slot name="overlay" />
        </div>
      </div>
    </Motion>

    <Motion
      v-if="showTooltip && captionText"
      as="figcaption"
      class="pointer-events-none absolute left-0 top-0 z-[3] hidden rounded-[4px] px-[10px] py-[4px] text-[10px] opacity-0 sm:block"
      :class="tooltipClass"
      :animate="{
        x: xValue,
        y: yValue,
        opacity: opacityValue,
        rotate: rotateFigcaptionValue,
      }"
      :transition="tooltipTransition"
    >
      {{ captionText }}
    </Motion>
  </figure>
</template>

<script setup lang="ts">
import { Motion } from 'motion-v'
import { computed, ref, useTemplateRef } from 'vue'

interface TiltedCardProps {
  imageSrc?: string
  altText?: string
  captionText?: string
  containerHeight?: string
  containerWidth?: string
  imageHeight?: string
  imageWidth?: string
  scaleOnHover?: number
  rotateAmplitude?: number
  showMobileWarning?: boolean
  showTooltip?: boolean
  displayOverlayContent?: boolean
  /** 亮色主题：占位块与提示条配色 */
  lightTheme?: boolean
  /** cover 铺满裁切；contain 完整显示（列表更清晰、少模糊） */
  imageFit?: 'cover' | 'contain'
}

const props = withDefaults(defineProps<TiltedCardProps>(), {
  imageSrc: '',
  altText: '壁纸',
  captionText: '',
  containerHeight: '100%',
  containerWidth: '100%',
  imageHeight: '100%',
  imageWidth: '100%',
  imageFit: 'cover',
  scaleOnHover: 1.1,
  rotateAmplitude: 14,
  showMobileWarning: false,
  showTooltip: true,
  displayOverlayContent: false,
  lightTheme: false,
})

const cardRef = useTemplateRef<HTMLElement>('cardRef')
const isHovered = ref(false)
const xValue = ref(0)
const yValue = ref(0)
const rotateXValue = ref(0)
const rotateYValue = ref(0)
const scaleValue = ref(1)
const opacityValue = ref(0)
const rotateFigcaptionValue = ref(0)
const lastY = ref(0)

const springTransition = computed(() => ({
  type: 'spring' as const,
  damping: 30,
  stiffness: 100,
  mass: 2,
}))

const tooltipTransition = computed(() => ({
  type: 'spring' as const,
  damping: 30,
  stiffness: 350,
  mass: 1,
}))

const hintClass = computed(() =>
  props.lightTheme ? 'text-slate-600' : 'text-slate-200/90',
)

const placeholderClass = computed(() =>
  props.lightTheme
    ? 'border border-slate-200/80 bg-slate-200/70 shadow-[0_10px_30px_rgba(0,0,0,0.12)]'
    : 'border border-white/15 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
)

const placeholderLabelClass = computed(() =>
  props.lightTheme ? 'text-slate-600/80' : 'text-white/55',
)

const tooltipClass = computed(() =>
  props.lightTheme ? 'bg-white text-[#2d2d2d] shadow-sm' : 'bg-white text-[#2d2d2d]',
)

function handleMouse(e: MouseEvent) {
  if (!cardRef.value) return

  const rect = cardRef.value.getBoundingClientRect()
  const offsetX = e.clientX - rect.left - rect.width / 2
  const offsetY = e.clientY - rect.top - rect.height / 2

  const rotationX = (offsetY / (rect.height / 2)) * -props.rotateAmplitude
  const rotationY = (offsetX / (rect.width / 2)) * props.rotateAmplitude

  rotateXValue.value = rotationX
  rotateYValue.value = rotationY

  xValue.value = e.clientX - rect.left
  yValue.value = e.clientY - rect.top

  const velocityY = offsetY - lastY.value
  rotateFigcaptionValue.value = -velocityY * 0.6
  lastY.value = offsetY
}

function handleMouseEnter() {
  isHovered.value = true
  scaleValue.value = props.scaleOnHover
  opacityValue.value = 1
}

function handleMouseLeave() {
  isHovered.value = false
  opacityValue.value = 0
  scaleValue.value = 1
  rotateXValue.value = 0
  rotateYValue.value = 0
  rotateFigcaptionValue.value = 0
}
</script>

<template>
  <div ref="containerRef" class="animated-content" :class="contentClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export type AnimatedFromCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

interface AnimatedContentProps {
  distance?: number
  /** 与 fromCorner 二选一：纵向或横向单一偏移 */
  direction?: 'vertical' | 'horizontal'
  reverse?: boolean
  /** 从角落进入时同时带 x/y 偏移（优先于 direction） */
  fromCorner?: AnimatedFromCorner | null
  duration?: number
  ease?: string
  initialOpacity?: number
  animateOpacity?: boolean
  scale?: number
  threshold?: number
  delay?: number
  contentClass?: string
}

const props = withDefaults(defineProps<AnimatedContentProps>(), {
  distance: 100,
  direction: 'vertical',
  reverse: false,
  fromCorner: null,
  duration: 0.8,
  ease: 'power3.out',
  initialOpacity: 0,
  animateOpacity: true,
  scale: 1,
  threshold: 0.1,
  delay: 0,
  contentClass: '',
})

const emit = defineEmits<{
  complete: []
}>()

const containerRef = useTemplateRef<HTMLDivElement>('containerRef')

let activeTween: gsap.core.Tween | null = null

function cornerOffsets(corner: AnimatedFromCorner, d: number): { x: number; y: number } {
  switch (corner) {
    case 'bottom-right':
      return { x: d, y: d }
    case 'bottom-left':
      return { x: -d, y: d }
    case 'top-right':
      return { x: d, y: -d }
    case 'top-left':
      return { x: -d, y: -d }
    default:
      return { x: 0, y: 0 }
  }
}

function runSetup() {
  const el = containerRef.value
  if (!el) return

  activeTween?.scrollTrigger?.kill()
  activeTween?.kill()
  activeTween = null
  gsap.killTweensOf(el)

  let x = 0
  let y = 0
  if (props.fromCorner) {
    const o = cornerOffsets(props.fromCorner, props.distance)
    x = o.x
    y = o.y
  } else {
    const axis = props.direction === 'horizontal' ? 'x' : 'y'
    const offset = props.reverse ? -props.distance : props.distance
    if (axis === 'x') x = offset
    else y = offset
  }

  const startPct = (1 - props.threshold) * 100

  gsap.set(el, {
    x,
    y,
    scale: props.scale,
    opacity: props.animateOpacity ? props.initialOpacity : 1,
  })

  activeTween = gsap.to(el, {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    duration: props.duration,
    ease: props.ease,
    delay: props.delay,
    onComplete: () => emit('complete'),
    scrollTrigger: {
      trigger: el,
      start: `top ${startPct}%`,
      toggleActions: 'play none none none',
      once: true,
      invalidateOnRefresh: true,
    },
  })
}

function teardown() {
  const el = containerRef.value
  activeTween?.scrollTrigger?.kill()
  activeTween?.kill()
  activeTween = null
  if (el) gsap.killTweensOf(el)
}

onMounted(() => {
  void nextTick(() => runSetup())
})

watch(
  () => [
    props.distance,
    props.direction,
    props.reverse,
    props.fromCorner,
    props.duration,
    props.ease,
    props.initialOpacity,
    props.animateOpacity,
    props.scale,
    props.threshold,
    props.delay,
  ],
  () => {
    void nextTick(() => runSetup())
  },
)

onUnmounted(() => {
  teardown()
})
</script>

<style scoped>
.animated-content {
  will-change: transform, opacity;
}
</style>

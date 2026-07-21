<template>
  <div class="min-w-0 w-full flex-1">
    <div class="relative min-w-0 max-w-full w-full" ref="containerRef">
      <nav
        class="flex w-full min-w-0 max-w-full items-center overflow-hidden"
        :style="{ transform: 'translate3d(0,0,0.01px)' }"
      >
        <ul
          ref="navRef"
          class="flex min-w-0 flex-1 list-none justify-between p-0 px-4 m-0 relative z-[3] text-[16px] max-[899px]:min-w-0 max-[899px]:flex-1 max-[899px]:justify-evenly max-[899px]:px-0.5 max-[899px]:text-[14px]"
          :class="props.lightTheme ? 'text-blue-700' : 'text-white'"
        >
          <li
            v-for="(item, index) in items"
            :key="index"
            :class="[
              'rounded-full relative cursor-pointer transition-[background-color_color_box-shadow] duration-300 ease shadow-[0_0_0.5px_1.5px_transparent]',
              props.lightTheme ? 'text-blue-700' : 'text-white',
              { active: activeIndex === index },
            ]"
          >
            <a
              :href="item.href || undefined"
              :aria-label="item.label"
              @click="(e) => handleClick(e, index)"
              @keydown="(e) => handleKeyDown(e, index)"
              class="outline-none py-[0.7em] px-[1.1em] inline-block max-[899px]:grid max-[899px]:min-h-[36px] max-[899px]:min-w-[34px] max-[899px]:max-w-[40px] max-[899px]:place-items-center max-[899px]:px-1 max-[899px]:py-1.5"
            >
              <span class="nav-item__label max-[899px]:sr-only">{{ item.label }}</span>
              <span
                class="nav-item__icon hidden max-[899px]:inline-flex max-[899px]:items-center max-[899px]:justify-center"
                aria-hidden="true"
              >
                <!-- 0 社区 -->
                <svg
                  v-if="index === 0"
                  class="h-[22px] w-[22px] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.65"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <!-- 1 电脑壁纸 -->
                <svg
                  v-else-if="index === 1"
                  class="h-[22px] w-[22px] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.65"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <!-- 2 手机壁纸 -->
                <svg
                  v-else-if="index === 2"
                  class="h-[22px] w-[22px] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.65"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="7" y="2" width="10" height="20" rx="2" />
                  <path d="M12 18h.01" stroke-width="2" />
                </svg>
                <!-- 3 头像 -->
                <svg
                  v-else-if="index === 3"
                  class="h-[22px] w-[22px] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.65"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20a8 8 0 0 1 16 0" />
                </svg>
                <!-- 4 下载 -->
                <svg
                  v-else
                  class="h-[22px] w-[22px] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.65"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 3v12m0 0l4-4m-4 4L8 11" />
                  <path d="M4 21h16" />
                  <path d="M6 17h12" opacity="0.5" />
                </svg>
              </span>
            </a>
          </li>
        </ul>

        <!-- 独立按钮：不参与标签切换动画 -->
        <div
          class="relative z-[4] ml-2 flex shrink-0 items-center gap-2 pr-3 max-[899px]:ml-0.5 max-[899px]:gap-1 max-[899px]:pr-1"
        >
          <!-- 主题：图1 亮色黄轨+左白圆+右云朵 / 图2 暗色靛蓝轨+左星星+右月亮；同 DOM 丝滑过渡 -->
          <button
            type="button"
            class="theme-switch shrink-0"
            :class="{ 'theme-switch--dark': themeIsDark }"
            @click="toggleTheme"
          >
            <span class="sr-only">主题</span>

            <!-- 左侧星星（暗色态） -->
            <span class="theme-switch__stars" aria-hidden="true">
              <svg class="theme-switch__stars-svg" viewBox="0 0 52 32" fill="none">
                <path
                  class="theme-switch__star theme-switch__star--lg"
                  d="M10 6l1.2 3.4h3.6l-2.9 2.1 1.1 3.5L10 12.6 6 15l1.1-3.5-2.9-2.1h3.6L10 6Z"
                  fill="#fff"
                />
                <path
                  class="theme-switch__star theme-switch__star--md"
                  d="M24 9l0.85 2.4h2.55l-2.05 1.5 0.78 2.45L24 13.9l-2.13 1.55 0.78-2.45-2.05-1.5h2.55L24 9Z"
                  fill="#fff"
                />
                <circle class="theme-switch__star-dot" cx="14" cy="24" r="1.35" fill="#fff" />
                <circle class="theme-switch__star-dot" cx="22" cy="22" r="0.9" fill="#fff" />
              </svg>
            </span>

            <!-- 右侧云朵高光（亮色态） -->
            <span class="theme-switch__clouds" aria-hidden="true">
              <span class="theme-switch__cloud theme-switch__cloud--a" />
              <span class="theme-switch__cloud theme-switch__cloud--b" />
            </span>

            <!-- 滑块：亮色=左「太阳」白圆；暗色=右移 + 遮罩成月牙 + 陨石坑 -->
            <span class="theme-switch__knob" aria-hidden="true">
              <span class="theme-switch__moon-cut" />
              <span class="theme-switch__crater theme-switch__crater--1" />
              <span class="theme-switch__crater theme-switch__crater--2" />
              <span class="theme-switch__crater theme-switch__crater--3" />
            </span>
          </button>

          <button
            type="button"
            class="grid h-9 w-12 place-items-center rounded-full backdrop-blur hover:bg-white/15"
            :class="props.lightTheme ? 'text-blue-800/90' : 'text-white/90'"
          >
            <span class="sr-only">通知</span>
            <!-- 铃铛 SVG -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 22a2.2 2.2 0 0 0 2.2-2.2H9.8A2.2 2.2 0 0 0 12 22Z"
                fill="currentColor"
              />
              <path
                d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      <!-- SVG Gooey Filter：不需要黑底，也能保持强对比粘连 -->
      <svg class="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <filter id="gooey-nav">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 18 -7
            "
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>

      <span class="effect filter" ref="filterRef" />
      <span class="effect text" ref="textRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

import { debounce } from '../utils/debounce'
import { VIEWPORT_RESIZE_DEBOUNCE_MS } from '../utils/viewportResize'

export interface GooeyNavItem {
  label: string
  href: string | null
}

interface GooeyNavProps {
  items: GooeyNavItem[]
  animationTime?: number
  particleCount?: number
  particleDistances?: [number, number]
  particleR?: number
  timeVariance?: number
  colors?: number[]
  /** 当前选中项下标；`-1` 表示不高亮（如壁纸详情页） */
  initialActiveIndex?: number
  /** 亮色主题：导航等文字用蓝色，与父级 app 背景 #DBDBDB 一致 */
  lightTheme?: boolean
}

const props = withDefaults(defineProps<GooeyNavProps>(), {
  animationTime: 600,
  particleCount: 15,
  particleDistances: () => [90, 10],
  particleR: 100,
  timeVariance: 300,
  colors: () => [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex: 0,
  lightTheme: false,
})

const emit = defineEmits<{
  (e: 'select', value: { index: number; item: GooeyNavItem }): void
  (e: 'theme', value: { background: '#393939' | '#DBDBDB'; isLight: boolean }): void
}>()

const themeIsDark = ref(true)
function toggleTheme() {
  themeIsDark.value = !themeIsDark.value
  const background = themeIsDark.value ? '#393939' : '#DBDBDB'
  // 组件内兜底：即使外层不处理 emit，也能看到背景变化
  document.body.style.backgroundColor = background
  emit('theme', { background, isLight: !themeIsDark.value })
}

const containerRef = ref<HTMLDivElement | null>(null)
const navRef = ref<HTMLUListElement | null>(null)
const filterRef = ref<HTMLSpanElement | null>(null)
const textRef = ref<HTMLSpanElement | null>(null)
const activeIndex = ref<number>(props.initialActiveIndex)

let resizeObserver: ResizeObserver | null = null
let navShellRoLastWidth = -1

const debouncedNavEffectLayout = debounce(() => {
  if (activeIndex.value < 0) return
  const currentActiveLi = navRef.value?.querySelectorAll('li')[activeIndex.value] as HTMLElement
  if (currentActiveLi) updateEffectPosition(currentActiveLi)
}, VIEWPORT_RESIZE_DEBOUNCE_MS)

const noise = (n = 1) => n / 2 - Math.random() * n

const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
  const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180)
  return [distance * Math.cos(angle), distance * Math.sin(angle)]
}

const createParticle = (i: number, t: number, d: [number, number], r: number) => {
  const rotate = noise(r / 10)
  return {
    start: getXY(d[0], props.particleCount - i, props.particleCount),
    end: getXY(d[1] + noise(7), props.particleCount - i, props.particleCount),
    time: t,
    scale: 1 + noise(0.2),
    color: props.colors[Math.floor(Math.random() * props.colors.length)],
    rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
  }
}

const makeParticles = (element: HTMLElement) => {
  const d: [number, number] = props.particleDistances
  const bubbleTime = props.animationTime * 2 + props.timeVariance
  element.style.setProperty('--time', `${bubbleTime}ms`)
  for (let i = 0; i < props.particleCount; i++) {
    const t = props.animationTime * 2 + noise(props.timeVariance * 2)
    const p = createParticle(i, t, d, props.particleR)
    element.classList.remove('active')
    setTimeout(() => {
      const particle = document.createElement('span')
      const point = document.createElement('span')
      particle.classList.add('particle')
      particle.style.setProperty('--start-x', `${p.start[0]}px`)
      particle.style.setProperty('--start-y', `${p.start[1]}px`)
      particle.style.setProperty('--end-x', `${p.end[0]}px`)
      particle.style.setProperty('--end-y', `${p.end[1]}px`)
      particle.style.setProperty('--time', `${p.time}ms`)
      particle.style.setProperty('--scale', `${p.scale}`)
      particle.style.setProperty('--color', `var(--color-${p.color}, white)`)
      particle.style.setProperty('--rotate', `${p.rotate}deg`)
      point.classList.add('point')
      particle.appendChild(point)
      element.appendChild(particle)
      requestAnimationFrame(() => {
        element.classList.add('active')
      })
      setTimeout(() => {
        try {
          element.removeChild(particle)
        } catch {}
      }, t)
    }, 30)
  }
}

const clearEffect = () => {
  if (filterRef.value) {
    filterRef.value.querySelectorAll('.particle').forEach((p) => p.remove())
    Object.assign(filterRef.value.style, {
      left: '0',
      top: '0',
      width: '0',
      height: '0',
      opacity: '0',
    })
  }
  textRef.value?.classList.remove('active')
}

const updateEffectPosition = (element: HTMLElement) => {
  if (!containerRef.value || !filterRef.value || !textRef.value) return
  const containerRect = containerRef.value.getBoundingClientRect()
  const pos = element.getBoundingClientRect()
  const styles = {
    left: `${pos.x - containerRect.x}px`,
    top: `${pos.y - containerRect.y}px`,
    width: `${pos.width}px`,
    height: `${pos.height}px`,
    opacity: '1',
  }
  Object.assign(filterRef.value.style, styles)
  Object.assign(textRef.value.style, styles)
  textRef.value.innerText = element.innerText
}

const handleClick = (e: Event, index: number) => {
  e.preventDefault()
  const liEl = (e.currentTarget as HTMLElement).parentElement as HTMLElement
  if (activeIndex.value === index) return
  activeIndex.value = index
  emit('select', { index, item: props.items[index]! })
  updateEffectPosition(liEl)
  if (filterRef.value) {
    const particles = filterRef.value.querySelectorAll('.particle')
    particles.forEach((p) => filterRef.value!.removeChild(p))
  }
  if (textRef.value) {
    textRef.value.classList.remove('active')
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    void textRef.value.offsetWidth
    textRef.value.classList.add('active')
  }
  if (filterRef.value) makeParticles(filterRef.value)
}

const handleKeyDown = (e: KeyboardEvent, index: number) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    const liEl = (e.currentTarget as HTMLElement).parentElement
    if (liEl) handleClick({ currentTarget: liEl } as unknown as Event, index)
  }
}

watch(activeIndex, () => {
  if (!navRef.value || !containerRef.value) return
  if (activeIndex.value < 0) {
    clearEffect()
    return
  }
  const activeLi = navRef.value.querySelectorAll('li')[activeIndex.value] as HTMLElement
  if (activeLi) {
    updateEffectPosition(activeLi)
    textRef.value?.classList.add('active')
  }
})

watch(
  () => props.initialActiveIndex,
  (n) => {
    activeIndex.value = n
  },
)

onMounted(() => {
  if (!navRef.value || !containerRef.value) return
  if (activeIndex.value < 0) {
    clearEffect()
  } else {
    const activeLi = navRef.value.querySelectorAll('li')[activeIndex.value] as HTMLElement
    if (activeLi) {
      updateEffectPosition(activeLi)
      textRef.value?.classList.add('active')
    }
  }
  resizeObserver = new ResizeObserver(([entry]) => {
    const w = Math.round(entry?.contentRect?.width ?? 0)
    if (w === navShellRoLastWidth) return
    navShellRoLastWidth = w
    debouncedNavEffectLayout()
  })
  resizeObserver.observe(containerRef.value)
})

onUnmounted(() => {
  debouncedNavEffectLayout.cancel()
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<style>
.effect {
  position: absolute;
  opacity: 1;
  pointer-events: none;
  display: grid;
  place-items: center;
  z-index: 1;
}
/* 原用于白底药丸上的叠字，已取消白底后隐藏，避免重影 */
.effect.text {
  color: transparent;
  opacity: 0;
  transition: none;
  pointer-events: none;
}
.effect.text.active {
  color: transparent;
  opacity: 0;
}
.effect.filter {
  /* 走 SVG gooey filter：不需要黑底板也能强对比粘连 */
  filter: url(#gooey-nav);
  mix-blend-mode: normal;
  z-index: -2;
}
.effect.filter::before {
  content: none;
}
.effect.filter::after {
  content: none;
  display: none;
}
.effect.active::after {
  animation: none;
}
.particle,
.point {
  display: block;
  opacity: 0;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  transform-origin: center;
}
.particle {
  --time: 5s;
  position: absolute;
  top: calc(50% - 8px);
  left: calc(50% - 8px);
  animation: particle calc(var(--time)) ease 1 -350ms;
}
.point {
  background: var(--color);
  opacity: 1;
  animation: point calc(var(--time)) ease 1 -350ms;
}
@keyframes particle {
  0% {
    transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y)));
    opacity: 1;
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }
  70% {
    transform: rotate(calc(var(--rotate) * 0.5))
      translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
    opacity: 1;
    animation-timing-function: ease;
  }
  85% {
    transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y)));
    opacity: 1;
  }
  100% {
    transform: rotate(calc(var(--rotate) * 1.2))
      translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
    opacity: 1;
  }
}
@keyframes point {
  0% {
    transform: scale(0);
    opacity: 0;
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }
  25% {
    transform: scale(calc(var(--scale) * 0.25));
  }
  38% {
    opacity: 1;
  }
  65% {
    transform: scale(var(--scale));
    opacity: 1;
    animation-timing-function: ease;
  }
  85% {
    transform: scale(var(--scale));
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}
li.active {
  /* color: rgba(255, 255, 255, 0); */
  font-weight: 600;
}
li.active::after {
  opacity: 1;
  transform: scale(1);
}
li::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 0 0.5px 1.5px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
  z-index: -1;
}
li.active {
  font-weight: 600;
}
li,
li a {
  text-shadow: none;
}
</style>

<style scoped>
/* 主题开关：亮色黄轨+左白圆+云朵 / 暗色靛蓝+星星+右月牙（不参与 gooey 标签动画） */
.theme-switch {
  --theme-switch-light: #ffb800;
  --theme-switch-dark: #3214a8;
  position: relative;
  width: 60px;
  height: 25px;
  border-radius: 9999px;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  /* 裁掉滑块/月牙遮罩超出轨道的部分，避免右侧「多出一圈蓝圆」 */
  overflow: hidden;
  background-color: var(--theme-switch-light);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
  transition:
    background-color 0.55s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-switch--dark {
  background-color: var(--theme-switch-dark);
  box-shadow: 0 4px 18px rgba(30, 10, 90, 0.45);
}

.theme-switch:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.65);
  outline-offset: 3px;
}

.theme-switch__stars {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%) scale(0.72);
  width: 34px;
  height: 22px;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition:
    opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.06s,
    transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.theme-switch--dark .theme-switch__stars {
  opacity: 1;
  transform: translateY(-50%) scale(0.79);
}

.theme-switch__stars-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.theme-switch__clouds {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 17px;
  pointer-events: none;
  z-index: 1;
  opacity: 1;
  transition:
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.5s cubic-bezier(0.34, 1.15, 0.64, 1);
}

.theme-switch--dark .theme-switch__clouds {
  opacity: 0;
  transform: translateY(-50%) translateX(10px) scale(0.85);
}

.theme-switch__cloud {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.theme-switch__cloud--a {
  width: 9px;
  height: 9px;
  right: 2px;
  top: 2px;
}

.theme-switch__cloud--b {
  width: 5px;
  height: 5px;
  right: 12px;
  top: 8px;
}

.theme-switch__knob {
  position: absolute;
  top: 50%;
  left: 4px;
  width: 22px;
  height: 22px;
  margin-top: -11px;
  border: none;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.18),
    0 1px 2px rgba(0, 0, 0, 0.12);
  z-index: 2;
  pointer-events: none;
  /* 月牙遮罩 translate 后不能溢出白圆，否则会顶破胶囊右侧 */
  overflow: hidden;
  transition:
    left 0.58s cubic-bezier(0.34, 1.25, 0.64, 1),
    box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-switch--dark .theme-switch__knob {
  /* 22px 宽 + 左右各 4px 内边距 = 贴内边缘 */
  left: calc(100% - 22px - 4px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.28),
    0 1px 2px rgba(0, 0, 0, 0.15);
}

.theme-switch__moon-cut {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--theme-switch-dark);
  /* 略减小右移，保证在 30px 圆内仍有月牙且不被父级裁成方角 */
  transform: translateX(38%) scale(0.86);
  opacity: 0;
  transition: opacity 0.42s cubic-bezier(0.4, 0, 0.2, 1) 0.12s;
  pointer-events: none;
}

.theme-switch--dark .theme-switch__moon-cut {
  opacity: 1;
}

.theme-switch:not(.theme-switch--dark) .theme-switch__moon-cut {
  background: var(--theme-switch-light);
}

.theme-switch__crater {
  position: absolute;
  border-radius: 50%;
  background: rgba(55, 55, 75, 0.45);
  opacity: 0;
  transition: opacity 0.38s ease 0.15s;
  pointer-events: none;
}

.theme-switch--dark .theme-switch__crater {
  opacity: 1;
}

.theme-switch__crater--1 {
  width: 5px;
  height: 5px;
  left: 6px;
  top: 9px;
}

.theme-switch__crater--2 {
  width: 3.5px;
  height: 3.5px;
  left: 14px;
  top: 16px;
}

.theme-switch__crater--3 {
  width: 4px;
  height: 4px;
  left: 11px;
  top: 5px;
}

@media (max-width: 899px) {
  .theme-switch {
    width: 72px;
    height: 28px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }

  .theme-switch--dark {
    box-shadow: 0 3px 12px rgba(30, 10, 90, 0.38);
  }

  .theme-switch__stars {
    left: 5px;
    width: 32px;
    height: 20px;
  }

  .theme-switch__clouds {
    right: 7px;
    width: 26px;
    height: 17px;
  }

  .theme-switch__cloud--a {
    width: 9px;
    height: 9px;
    right: 1px;
    top: 1px;
  }

  .theme-switch__cloud--b {
    width: 5px;
    height: 5px;
    right: 12px;
    top: 8px;
  }

  .theme-switch__knob {
    left: 3px;
    width: 22px;
    height: 22px;
    margin-top: -11px;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.16),
      0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .theme-switch--dark .theme-switch__knob {
    left: calc(100% - 22px - 3px);
    box-shadow:
      0 3px 9px rgba(0, 0, 0, 0.24),
      0 1px 2px rgba(0, 0, 0, 0.12);
  }

  .theme-switch__crater--1 {
    width: 4px;
    height: 4px;
    left: 4px;
    top: 7px;
  }

  .theme-switch__crater--2 {
    width: 3px;
    height: 3px;
    left: 11px;
    top: 12px;
  }

  .theme-switch__crater--3 {
    width: 3px;
    height: 3px;
    left: 8px;
    top: 4px;
  }
}
</style>

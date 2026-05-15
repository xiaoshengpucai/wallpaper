<template>
  <div
    class="flex h-full min-h-0 w-full max-w-full items-center justify-center rounded-[2rem] border-[1.5px] border-white/10 bg-gradient-to-br from-white/8 via-white/4 bg-white/5 to-transparent p-3 backdrop-blur-xl"
    style="
      width: 670px; 
      height: 850px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12),
        0 2px 8px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        inset 0 -1px 0 rgba(255, 255, 255, 0.05),
        inset 2px 2px 10px rgba(0, 0, 0, 0.5),
        inset -2px -2px 4px rgba(255, 255, 255, 0.5);
    ">
    <div class="relative flex max-h-full w-fit max-w-full items-center justify-center"
      style="width: 600px; height: 850px;">
      <svg class="h-full w-auto" viewBox="0 0 340 700" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient :id="frameGradId" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#505a6d" />
            <stop offset="50%" stop-color="#2d333d" />
            <stop offset="100%" stop-color="#1a1d24" />
          </linearGradient>
          <clipPath :id="clipId">
            <rect x="12" y="12" width="316" height="676" rx="46" ry="46" />
          </clipPath>
          <filter :id="glowFilterId">
            <feGaussianBlur stdDeviation="12" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- 外层金属边框 -->
        <rect x="0" y="0" width="340" height="700" rx="48" :fill="`url(#${frameGradId})`" />

        <!-- 内层屏幕黑边 -->
        <rect x="8" y="8" width="324" height="684" rx="44" fill="#000" />

        <!-- 屏幕内容区域（430:932 比例） -->
        <g :clip-path="`url(#${clipId})`">
          <!-- Loading 状态 -->
          <rect v-if="imageLoading" x="12" y="12" width="316" height="676" fill="#0a0a0a" />

          <!-- 图片内容 -->
          <image v-if="imageUrl" :href="imageUrl" x="12" y="12" width="316" height="676"
            preserveAspectRatio="xMidYMid slice" @load="handleImageLoad" @error="handleImageError"
            :style="{ opacity: imageLoading ? 0 : 1, transition: 'opacity 0.3s ease' }" />

          <!-- 空状态/错误状态 -->
          <rect v-if="!imageUrl || imageError" x="12" y="12" width="316" height="676" fill="#0a0a0a" />
        </g>

        <!-- 空状态/错误图标 -->
        <g v-if="(!imageUrl || imageError) && !imageLoading" :clip-path="`url(#${clipId})`">
          <svg x="110" y="270" width="120" height="120" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
              fill="#ffffff" opacity="0.15" />
          </svg>
          <text x="170" y="420" text-anchor="middle" fill="#ffffff" opacity="0.3" font-size="12">
            {{ imageError ? '加载失败' : '无预览图' }}
          </text>
        </g>

        <!-- 屏幕内边框 -->
        <rect x="12" y="12" width="316" height="676" rx="46" fill="none" stroke="#ffffff" stroke-opacity="0.08"
          stroke-width="1" />

        <!-- 摄像头和传感器细节 -->
        <circle cx="148" cy="32" r="4.5" fill="#0f1419" opacity="0.9" />
        <rect x="178" y="27" width="18" height="10" rx="5" fill="#0a0d12" opacity="0.7" />

        <!-- 侧边按键（左侧静音开关） -->
        <rect x="0" y="120" width="2" height="28" rx="1" fill="#000" opacity="0.5" />
        <!-- 左侧音量键 -->
        <rect x="0" y="170" width="2" height="48" rx="1" fill="#000" opacity="0.5" />
        <rect x="0" y="230" width="2" height="48" rx="1" fill="#000" opacity="0.5" />

        <!-- 右侧电源键 -->
        <rect x="338" y="190" width="2" height="68" rx="1" fill="#000" opacity="0.5" />

        <!-- 底部扬声器孔 -->
        <g opacity="0.3">
          <rect x="100" y="690" width="3" height="3" rx="1.5" fill="#1a1d24" />
          <rect x="110" y="690" width="3" height="3" rx="1.5" fill="#1a1d24" />
          <rect x="120" y="690" width="3" height="3" rx="1.5" fill="#1a1d24" />
          <rect x="220" y="690" width="3" height="3" rx="1.5" fill="#1a1d24" />
          <rect x="230" y="690" width="3" height="3" rx="1.5" fill="#1a1d24" />
          <rect x="240" y="690" width="3" height="3" rx="1.5" fill="#1a1d24" />
        </g>
      </svg>

      <!-- 图片加载 loading（覆盖手机屏幕区域） -->
      <div
        v-if="imageLoading && imageUrl"
        class="pointer-events-none absolute left-1/2 top-[1.7%] flex h-[96.5%] w-[64%] -translate-x-1/2 items-center justify-center overflow-hidden rounded-[3.2rem] bg-[#0a0a0a]/90"
      >
        <WaveLoader />
      </div>

      <!-- 屏幕内容交互区域 -->
      <div class="absolute left-[2.2%] top-[1.7%] h-[96.6%] w-[95.6%] cursor-pointer rounded-[46px]"
        @mouseenter="handleScreenEnter" @mouseleave="handleScreenLeave" />

      <!-- 灵动岛交互层 -->
      <div
        class="dynamic-island pointer-events-none absolute left-1/2 top-[3.2%] -translate-x-1/2 overflow-hidden rounded-full bg-black/95 transition-all ease-out"
        :class="{
          'dynamic-island-medium': islandStage === 'medium',
          'dynamic-island-expanded': islandStage === 'full'
        }" :style="{
          transitionDuration: islandStage === 'default' ? '500ms' : '400ms'
        }" style="
          width: 100px;
          height: 28px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.08);
        ">
        <!-- 默认状态：摄像头和传感器 -->
        <div class="absolute inset-0 flex items-center justify-center gap-5 transition-opacity duration-300"
          :style="{ opacity: islandStage === 'default' ? 1 : 0 }">
          <div class="h-[8px] w-[8px] rounded-full bg-[#0f1419]" />
          <div class="h-[8px] w-[16px] rounded-md bg-[#0a0d12] opacity-70" />
        </div>

        <!-- 中间状态：简化通话界面 -->
        <div class="absolute inset-0 flex items-center justify-between px-3 transition-opacity duration-300"
          :style="{ opacity: islandStage === 'medium' ? 1 : 0 }">
          <!-- 文字 -->
          <div class="text-[11px] font-medium leading-tight text-white/90">iphone</div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2">
            <!-- 挂断按钮 -->
            <button class="flex h-5 w-5 items-center justify-center " @click.stop>
              <svg t="1776159983838" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="5357" width="100" height="100">
                <path
                  d="M57.856 600.106667a52.394667 52.394667 0 0 1 0-73.813334c245.674667-246.613333 645.034667-246.613333 891.648 0 20.266667 20.394667 20.266667 53.333333 0 73.770667l-89.514667 89.557333a51.84 51.84 0 0 1-73.301333 0.426667 411.562667 411.562667 0 0 0-101.973333-74.24 51.584 51.584 0 0 1-28.373334-46.464l-0.512-100.693333c-99.413333-29.781333-205.354667-29.866667-304.810666-0.170667v100.138667c-0.128 19.626667-11.093333 37.589333-28.586667 46.634666a394.154667 394.154667 0 0 0-101.589333 74.069334c-20.48 20.224-53.376 20.224-73.813334-0.042667l-89.173333-89.173333z"
                  fill="#F5222D" p-id="5358"></path>
              </svg>
            </button>

            <!-- 接听按钮 -->
            <button class="flex h-5 w-5 items-center justify-center" @click.stop>
              <svg t="1776160198252" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="6568" width="200" height="200">
                <path
                  d="M234.453333 189.397333c48.64-28.074667 86.016-12.501333 123.392 37.12 43.946667 58.410667 73.472 115.456 26.154667 156.501334 0 0-51.626667 43.52 69.205333 171.648 141.525333 148.992 191.744 86.442667 191.744 86.442666 51.882667-51.797333 90.624-18.858667 149.290667 24.618667 58.624 43.434667 77.226667 87.338667 26.752 150.357333-97.194667 121.429333-325.461333-49.792-414.208-136.362666 0 0-135.722667-131.669333-180.906667-214.528l-24.704-44.288c-32.512-63.573333-47.36-134.997333-17.194666-185.258667 0 0 12.416-24.234667 50.474666-46.250667z"
                  fill="#1afa29" p-id="6569"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- 完全展开状态：详细通话界面 -->
        <div class="absolute inset-0 flex items-center gap-2.5 px-3 transition-opacity duration-300"
          :style="{ opacity: islandStage === 'full' ? 1 : 0 }">
          <!-- 头像 -->
          <div class="flex-shrink-0">
            <div class="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
              <svg class="h-full w-full text-white/90" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>

          <!-- 文字信息 -->
          <div class="flex-1 overflow-hidden">
            <div class="text-[11px] font-medium leading-tight text-white/90">iPhone</div>
            <div class="text-[9px] leading-tight text-white/60">来电</div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-shrink-0 items-center gap-1.5">
            <!-- 挂断按钮 -->
            <button
              class="flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
              @click.stop>
              <svg t="1776160402943" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="10080" width="200" height="200"
                style="transform: rotate(135deg)">
                <path
                  d="M512 0c282.7776 0 512 229.2224 512 512s-229.2224 512-512 512S0 794.7776 0 512 229.2224 0 512 0zM396.8 281.6H307.0464a25.6 25.6 0 0 0-25.4464 25.4464c0 240.4864 194.8672 435.3536 435.3536 434.8928a25.6 25.6 0 0 0 25.4464-25.4464V627.2a25.6 25.6 0 0 0-25.4464-25.4464 290.9184 290.9184 0 0 1-91.648-14.3872 26.0608 26.0608 0 0 0-25.9584 6.2464L543.232 649.728a388.3008 388.3008 0 0 1-168.96-168.96l56.1664-56.6784a25.0368 25.0368 0 0 0 6.2464-25.9072 302.9504 302.9504 0 0 1-14.3872-91.648 25.1904 25.1904 0 0 0-25.4464-24.9856z"
                  fill="#FF4B39" p-id="10081"></path>
              </svg>
            </button>

            <!-- 接听按钮 -->
            <button
              class="flex h-7 w-7 items-center justify-center rounded-full  transition-transform hover:scale-110 active:scale-95"
              @click.stop>
              <svg t="1776160268747" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="6925" width="200" height="200">
                <path
                  d="M511.868892 1023.999069A512.008492 512.008492 0 0 1 312.627803 40.489527a512.000737 512.000737 0 0 1 398.482177 943.289056A508.665833 508.665833 0 0 1 511.868892 1023.999069zM343.05298 313.881805L324.183631 334.232471a86.443798 86.443798 0 0 0-17.992967 30.386399 115.054167 115.054167 0 0 0-6.095893 43.04352c0.961693 27.865832 14.851953 65.302062 39.119192 105.398458a511.155378 511.155378 0 0 0 85.683751 105.848283c64.891015 60.67973 146.782283 99.899745 208.625351 99.899745a105.778482 105.778482 0 0 0 42.764319-8.073568 88.475762 88.475762 0 0 0 23.794148-15.511179h0.054289l1.985431-1.326206a13.184502 13.184502 0 0 0 2.443011-2.03972l19.854308-21.366648a13.471459 13.471459 0 0 0 3.598594-9.609175 13.316347 13.316347 0 0 0-4.265574-9.306707l-9.616931-8.965462-83.496674-78.106539a13.300836 13.300836 0 0 0-9.120573-3.598594h-0.473091a13.424925 13.424925 0 0 0-9.306707 4.281086l-20.839269 22.390386-14.130683 15.216466a56.282311 56.282311 0 0 1-9.384263 0.65147 112.936891 112.936891 0 0 1-38.731413-7.429855 171.739769 171.739769 0 0 1-57.391361-36.668426 161.432591 161.432591 0 0 1-46.59558-70.971397 86.986689 86.986689 0 0 1-4.203529-31.301559l35.202619-37.824009a13.432681 13.432681 0 0 0-0.66698-18.95466l-93.067072-87.048734a13.331858 13.331858 0 0 0-9.128328-3.598593h-0.473091a13.277569 13.277569 0 0 0-9.306707 4.250063z"
                  fill="#47E08E" p-id="6926"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 锁屏信息区域 -->
      <div class="pointer-events-none absolute left-1/2 top-[13%] w-[55%] -translate-x-1/2 text-center">
        <!-- 日期信息 -->
        <div class="mb-2.5 text-xs font-medium tracking-wide text-white/90"
          style="text-shadow: 0 2px 8px rgba(0,0,0,0.5)">
          {{ displayDate }}
        </div>

        <!-- 锁屏时间（带边框 + TextPressure 悬停动效） -->
        <div class="rounded-[15px] border-[2px] border-white/20 px-4 py-2" style="background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.2));
        box-shadow: inset 0 0 10px 0 #022143,
        inset 0 -4px 3px rgba(255,255,255,0.6),
        inset 0 4px 3px rgba(35,82,133,0.3);">
          <TextPressure :text="displayClock" :flex="true" :alpha="false" :stroke="false" :width="true" :weight="true"
            :italic="true" text-color="#fff" stroke-color="#27FF64" :min-font-size="12" />
        </div>
      </div>

      <!-- 底部 Home Indicator -->
      <div
        class="home-indicator pointer-events-none absolute bottom-[5%] left-1/2 h-[4px] w-[120px] -translate-x-1/2 rounded-full bg-white shadow-lg transition-all duration-300 ease-out"
        :class="{ 'home-indicator-active': isScreenHovered }" style="opacity: 0.92" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import WaveLoader from '../WaveLoader.vue'
import TextPressure from './TextPressure.vue'

const props = defineProps<{
  imageUrl: string
  /** 若传入非空字符串则固定显示，否则为 Asia/Shanghai 实时时分（每秒刷新） */
  clockText?: string
}>()

const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const clipId = computed(() => `ph-screen-${uid}`)
const frameGradId = computed(() => `ph-frame-${uid}`)
const glowFilterId = computed(() => `ph-glow-${uid}`)

const isScreenHovered = ref(false)
const islandStage = ref<'default' | 'medium' | 'full'>('default')
const imageLoading = ref(true)
const imageError = ref(false)

let stageTimer: ReturnType<typeof setTimeout> | undefined

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

function handleScreenEnter() {
  isScreenHovered.value = true
  islandStage.value = 'medium'

  if (stageTimer) clearTimeout(stageTimer)
  stageTimer = setTimeout(() => {
    islandStage.value = 'full'
  }, 500)
}

function handleScreenLeave() {
  isScreenHovered.value = false
  islandStage.value = 'default'

  if (stageTimer) {
    clearTimeout(stageTimer)
    stageTimer = undefined
  }
}

const liveBeijing = ref('')
const liveDate = ref('')

function formatBeijingHm() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date())
}

function formatBeijingDate() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
  })
  const parts = formatter.formatToParts(now)
  const month = parts.find(p => p.type === 'month')?.value || ''
  const day = parts.find(p => p.type === 'day')?.value || ''
  const weekday = parts.find(p => p.type === 'weekday')?.value || ''

  // 天干地支计算
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const year = now.getFullYear()
  const stemIndex = (year - 4) % 10
  const branchIndex = (year - 4) % 12
  const ganZhi = heavenlyStems[stemIndex] + earthlyBranches[branchIndex]

  // 农历月份和日期名称
  const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

  // 2026年农历数据（基于2026年春节2月17日）
  // 2026年正月初一：2月17日，正月30天，二月初一：3月19日
  const springFestival2026 = new Date(2026, 1, 17) // 2026年2月17日
  const daysDiff = Math.floor((now.getTime() - springFestival2026.getTime()) / 86400000)

  // 2026年农历各月天数（正月到腊月）
  const monthDays2026 = [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30] // 示例数据

  let lunarMonth = 0
  let lunarDay = daysDiff + 1 // 加1因为初一是第1天

  // 如果是春节之前，处理上一年
  if (lunarDay <= 0) {
    lunarMonth = 11
    lunarDay = 30 + lunarDay
  } else {
    // 逐月累减找到当前月份
    while (lunarDay > monthDays2026[lunarMonth] && lunarMonth < 12) {
      lunarDay -= monthDays2026[lunarMonth]
      lunarMonth++
    }
  }

  const lunarMonthName = lunarMonths[lunarMonth] || '正'
  const lunarDayName = lunarDays[lunarDay - 1] || '初一' // 减1因为数组从0开始

  return `${month}月${day}日${weekday} · ${ganZhi}年${lunarMonthName}月${lunarDayName}`
}

function tickClock() {
  const fixed = props.clockText?.trim()
  if (fixed) {
    liveBeijing.value = fixed
    return
  }
  liveBeijing.value = formatBeijingHm()
  liveDate.value = formatBeijingDate()
}

const displayClock = computed(() => liveBeijing.value || formatBeijingHm())
const displayDate = computed(() => liveDate.value || formatBeijingDate())

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  tickClock()
  if (!props.clockText?.trim()) {
    timer = setInterval(tickClock, 1000)
  }
})

watch(
  () => props.clockText,
  () => {
    tickClock()
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
    if (!props.clockText?.trim()) {
      timer = setInterval(tickClock, 1000)
    }
  },
)

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (stageTimer) clearTimeout(stageTimer)
})
</script>

<style scoped>
.dynamic-island-medium {
  width: 150px !important;
  height: 36px !important;
  border-radius: 18px !important;
}

.dynamic-island-expanded {
  width: 200px !important;
  height: 48px !important;
  border-radius: 24px !important;
}

.home-indicator {
  will-change: transform, box-shadow;
}

.home-indicator-active {
  transform: translateX(-50%) translateY(-4px) !important;
  opacity: 1 !important;
  background-color: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.3) !important;
}
</style>

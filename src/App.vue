<template>
  <!-- 离开电脑壁纸详情后：在非详情路由下透出上次预览的模糊背景（与 WallpaperDetailPage Teleport 一致） -->
  <Teleport to="body">
    <div v-if="showGlobalWallpaperBackdrop" class="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden="true">
      <div
        class="absolute left-1/2 top-1/2 min-h-[130%] min-w-[130%] -translate-x-1/2 -translate-y-1/2 bg-cover bg-center"
        :style="{ backgroundImage: globalWallpaperBackdropCss }" />
      <div class="absolute inset-0 bg-black/55" />
    </div>
  </Teleport>

  <div class="relative z-10 min-h-full max-w-[100vw] overflow-x-hidden" :style="appRootSurfaceStyle"
    :data-theme="appThemeLight ? 'light' : 'dark'">
    <TopProgress :width="progressWidth" :visible="progressVisible" />

    <div :class="{ 'header-placeholder': isHeaderFixed }"
      :style="{ height: isHeaderFixed ? `${headerHeight}px` : undefined }">
      <header ref="headerRef"
        class="relative z-40 min-w-0 pt-[20px] font-xingkai max-[899px]:px-3 max-[899px]:pt-4 transition-all duration-300"
        :class="{ 'fixed-header': isHeaderFixed }">
        <div
          class="mx-auto flex w-[90%] max-w-full min-w-0 items-center justify-between gap-4 max-[899px]:w-full max-[899px]:flex-col max-[899px]:items-stretch max-[899px]:gap-3 nav:flex-row">
          <!-- 移动端首行：品牌 + 登录 -->
          <div class="flex w-full min-w-0 max-w-full items-center justify-between gap-2 nav:hidden">
            <div class="min-w-0 max-w-[calc(100%-3.25rem)] shrink overflow-hidden">
              <GlitchText children="凉云图集" :speed="0.5" :enable-shadows="true" :enable-on-hover="true"
                :light-theme="appThemeLight" />
            </div>

            <div ref="loginWrapRef" class="relative">
              <button type="button" @click.stop="toggleLoginPopover"
                class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border bg-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.38)] backdrop-blur cursor-pointer transition-transform hover:scale-105 active:scale-95"
                :class="appThemeLight
                  ? 'border-slate-400/55 bg-white/75'
                  : 'border-white/55'
                  ">
                <template v-if="authInitialized && authStore.user">
                  <div class="relative h-15 w-15 overflow-hidden rounded-xl border-2 border-white/30">
                    <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.user.nickname"
                      class="h-full w-full object-cover" />
                    <div v-else
                      class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/30 to-purple-500/30">
                      <span class="text-lg font-bold text-white/80">{{ (authStore.user?.nickname || '').slice(0, 1)
                      }}</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div
                    class="grid h-10 w-10 place-items-center rounded-md bg-indigo-500/20 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
                    :style="{ transform: 'rotate(-12deg)' }">
                    <span>{{ authInitialized ? '登录' : '...' }}</span>
                  </div>
                </template>
              </button>

              <!-- 移动端弹出框 -->
              <div v-if="loginPopoverVisible" ref="mobileLoginPopoverRef"
                class="pointer-events-auto absolute right-0 top-full z-50 w-[200px]"
                style="margin-top: 8px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
                <LoginPanel :is-authenticated="authInitialized && authStore.isAuthenticated" :user="authStore.user"
                  :is-mobile="true" @wechat-login="handleWechatLogin" @phone-login="openLoginModal"
                  @personal-center="handlePersonalCenter" @logout="handleLogout" />
              </div>
            </div>
          </div>

          <!-- 移动端首行（桌面端）：品牌 -->
          <div class="hidden min-w-0 max-w-none  nav:block">
            <div class="min-w-0 max-w-none  shrink overflow-hidden">
              <GlitchText children="凉云图集" :speed="0.5" :enable-shadows="true" :enable-on-hover="true"
                :light-theme="appThemeLight" />
            </div>
          </div>

          <!-- 导航：桌面中间条；移动端第二行全宽胶囊 -->
          <div
            class="nav-shell relative flex w-full min-w-0 max-w-full items-center overflow-hidden rounded-full border bg-transparent px-1.5 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            :class="appThemeLight
              ? 'border-slate-400/40 text-slate-700'
              : 'border-white/10 text-slate-200'
              ">
            <GooeyNav :items="navItems" :animation-time="600" :particle-count="15" :particle-distances="[90, 10]"
              :particle-r="100" :time-variance="300" :colors="[1, 2, 3, 1, 2, 3, 1, 4]"
              :initial-active-index="activeIndex" :light-theme="appThemeLight" @select="onNavSelect"
              @theme="onAppTheme" />
          </div>

          <!-- 右侧（>=900 显示） -->
          <div class="hidden shrink-0 w-[150px] items-center gap-3 nav:flex flex-col items-center">
            <!-- 未登录：登录按钮 / 已登录：头像 -->
            <div ref="loginWrapRef"
              class="group relative z-50 transition-transform duration-200 ease-out login-edge-shift"
              @mouseleave="closeLoginPopover">
              <button type="button" @mouseenter="openLoginPopover"
                class="grid h-20 w-20 place-items-center rounded-2xl border border-white/60 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur cursor-pointer transition-transform hover:scale-105 active:scale-95">
                <template v-if="authInitialized && authStore.user">
                  <div class="relative h-15 w-15 overflow-hidden rounded-xl border-2 border-white/30">
                    <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.user.nickname"
                      class="h-full w-full object-cover" />
                    <div v-else
                      class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/30 to-purple-500/30">
                      <span class="text-lg font-bold text-white/80">{{ (authStore.user?.nickname || '').slice(0, 1)
                      }}</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div
                    class="grid h-10 w-10 place-items-center rounded-md bg-indigo-500/20 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
                    :style="{ transform: 'rotate(-12deg)' }">
                    <span>{{ authInitialized ? '登录' : '...' }}</span>
                  </div>
                </template>
              </button>

              <!-- 桌面端弹出框 -->
              <!-- 桌面端弹出框 -->
              <Transition name="popover">
                <div v-if="loginPopoverVisible" ref="loginPopoverRef"
                  class="z-[-1] pointer-events-auto absolute left-1/2 -translate-x-1/2 top-full origin-top"
                  style="top: calc(100% - 20px); font-family: 'Microsoft YaHei', '微软雅黑', sans-serif; font-weight: bold;">
                  <div
                    class="rounded-3xl border border-white/15 bg-black/10 w-[200px] h-[200px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                    <LoginPanel :is-authenticated="authInitialized && authStore.isAuthenticated" :user="authStore.user"
                      :is-mobile="false" @wechat-login="handleWechatLogin" @phone-login="openLoginModal"
                      @personal-center="handlePersonalCenter" @logout="handleLogout" />
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </header>
    </div>

    <!-- 列表 / 首页等：固定宽度比例与内边距 -->
    <main v-if="!isWallpaperDetailRoute"
      class="app-main-site mx-auto min-w-0 max-w-[100vw] px-4 py-10 max-[899px]:max-w-full max-[899px]:px-2 max-[899px]:py-6">
      <RouterView />
    </main>

    <!-- 壁纸详情：独立布局（全宽舞台，不与站点 main 共用 class） -->
    <main v-else class="app-main-wallpaper-detail">
      <RouterView />
    </main>

    <LoginModal :visible="loginModalVisible" @close="closeLoginModal" @login-success="handleLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, provide, ref, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const GooeyNav = defineAsyncComponent(() => import('./components/GooeyNav2.vue'))
const GlitchText = defineAsyncComponent(() => import('./components/GlitchText.vue'))
const TopProgress = defineAsyncComponent(() => import('./components/TopProgress.vue'))
const LoginModal = defineAsyncComponent(() => import('./components/LoginModal.vue'))
const LoginPanel = defineAsyncComponent(() => import('./components/LoginPanel.vue'))
import type { GooeyNavItem } from './components/GooeyNav2.vue'
import { debounce } from './utils/debounce'
import { progress } from './utils/progress'
import { lastWallpaperBackdropUrl } from './utils/wallpaperBackdropMemory'
import { readWallpaperDetailCache } from './utils/wallpaperDetailCache'
import { ROUTE_NAME_WALLPAPER_DETAIL } from './router'
import { useAuthStore } from './stores/auth'


// 登录
const handleWechatLogin = () => {
}

const handlePersonalCenter = () => {
  closeLoginPopover()
  router.push('/profile')
}

const openLoginModal = () => {
  loginModalVisible.value = true
  closeLoginPopover()
}

const closeLoginModal = () => {
  loginModalVisible.value = false
}

const authStore = useAuthStore()

const handleLoginSuccess = () => {
  loginModalVisible.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  closeLoginPopover()
}

type TabKey = 'community' | 'pc' | 'mobile' | 'avatar' | 'download'

const appBg = ref<'#393939' | '#DBDBDB'>('#393939')
const appThemeLight = ref(false)

function onAppTheme(payload: { background: '#393939' | '#DBDBDB'; isLight: boolean }) {
  appBg.value = payload.background
  appThemeLight.value = payload.isLight
}

provide('appThemeLight', appThemeLight)

const authInitialized = ref(false)

const initAuth = async () => {
  authStore.hydrate()

  if (authStore.isAuthenticated) {
    try {
      await authStore.getCurrentUser()
    } catch (e: any) {
      if (e?.api?.status === 401) {
        await authStore.logout()
      }
    }
  }

  authInitialized.value = true
}

initAuth()

const loginPopoverVisible = ref(false)
const loginEdgeShiftPx = ref(0)
const loginPopoverRef = ref<HTMLElement | null>(null)
const mobileLoginPopoverRef = ref<HTMLElement | null>(null)
const loginModalVisible = ref(false)
const isHeaderFixed = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const headerHeight = ref(0)

const openLoginPopover = () => {
  loginPopoverVisible.value = true
}

const closeLoginPopover = () => {
  loginPopoverVisible.value = false
  loginEdgeShiftPx.value = 0
}

const toggleLoginPopover = () => {
  if (loginPopoverVisible.value) {
    closeLoginPopover()
  } else {
    openLoginPopover()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (loginPopoverVisible.value) {
    const target = event.target as HTMLElement
    const desktopWrap = loginPopoverRef.value?.parentElement
    const mobileWrap = mobileLoginPopoverRef.value?.parentElement

    const isInsideDesktop = desktopWrap?.contains(target)
    const isInsideMobile = mobileWrap?.contains(target)

    // 桌面端：只有在移动端模式下才使用点击外部关闭
    const isDesktopMode = window.innerWidth >= 900
    if (isDesktopMode) {
      // 桌面端不使用点击外部关闭，只依赖 hover
      return
    }

    if (!isInsideDesktop && !isInsideMobile) {
      closeLoginPopover()
    }
  }
}

const handleScroll = () => {
  isHeaderFixed.value = window.scrollY > headerHeight.value
}

const updateHeaderHeight = () => {
  if (headerRef.value) {
    headerHeight.value = headerRef.value.getBoundingClientRect().height
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', updateHeaderHeight, { passive: true })
  updateHeaderHeight()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updateHeaderHeight)
})

const tabs = [
  {
    key: 'community',
    label: '壁纸社区',
  },
  {
    key: 'pc',
    label: '电脑壁纸',
  },
  {
    key: 'mobile',
    label: '手机壁纸',
  },
  {
    key: 'avatar',
    label: '头像制作',
  },
  {
    key: 'download',
    label: '软件下载',
  },
] as const satisfies ReadonlyArray<{ key: TabKey; label: string }>

const route = useRoute()
const router = useRouter()

const isWallpaperDetailRoute = computed(() => route.name === ROUTE_NAME_WALLPAPER_DETAIL)

const showGlobalWallpaperBackdrop = computed(
  () =>
    !isWallpaperDetailRoute.value &&
    !appThemeLight.value &&
    Boolean(lastWallpaperBackdropUrl.value.trim()),
)

const globalWallpaperBackdropCss = computed(() => {
  const u = lastWallpaperBackdropUrl.value.trim()
  if (!u) return 'none'
  return `url(${JSON.stringify(u)})`
})

/**
 * 暗色电脑壁纸详情且存在缓存图时根容器透明，便于透出 Teleport 的模糊壁纸层；
 * 手机壁纸详情、亮色模式始终实色底（不要 body 背景图）。
 * 非详情 + 暗色 + 已记住上次详情背景时同样透明，透出全局模糊层。
 */
const appRootSurfaceStyle = computed(() => {
  if (route.name === ROUTE_NAME_WALLPAPER_DETAIL) {
    if (appThemeLight.value) {
      return { backgroundColor: appBg.value }
    }
    const raw = route.params.id
    const id = Array.isArray(raw) ? raw[0] : raw
    const hit = id != null && id !== '' ? readWallpaperDetailCache(String(id)) : null
    const q = route.query.kind
    const qk = Array.isArray(q) ? q[0] : q
    const isMobileDetail = qk === 'mobile' || (qk !== 'pc' && hit?.kind === 'mobile')
    if (isMobileDetail) {
      return { backgroundColor: appBg.value }
    }
    if (hit?.imageUrl?.trim()) {
      return { backgroundColor: 'transparent' }
    }
    return { backgroundColor: appBg.value }
  }
  if (!appThemeLight.value && lastWallpaperBackdropUrl.value.trim()) {
    return { backgroundColor: 'transparent' }
  }
  return { backgroundColor: appBg.value }
})

const keyToPath: Record<TabKey, string> = {
  community: '/community',
  pc: '/pc',
  mobile: '/mobile',
  avatar: '/avatar',
  download: '/download',
}

function pathToKey(path: string): TabKey {
  if (path.startsWith('/community')) return 'community'
  if (path.startsWith('/mobile')) return 'mobile'
  if (path.startsWith('/avatar')) return 'avatar'
  if (path.startsWith('/download')) return 'download'
  return 'pc'
}

const activeKey = computed(() => pathToKey(route.path))
/** 详情页、个人主页不高亮任何导航项；其余路径未匹配时默认电脑壁纸（与 `/` → `/pc` 一致） */
const activeIndex = computed(() => {
  if (isWallpaperDetailRoute.value) return -1
  if (route.path.startsWith('/profile')) return -1
  const idx = tabs.findIndex((t) => t.key === activeKey.value)
  return idx >= 0 ? idx : 1
})

const navItems = computed<GooeyNavItem[]>(() =>
  tabs.map((t) => ({
    label: t.label,
    href: keyToPath[t.key],
  })),
)

const goToKey = async (key: TabKey) => {
  const path = keyToPath[key]
  if (router.currentRoute.value.path === path) return
  await router.push(path)
}

const debouncedGoToKey = debounce((key: TabKey) => {
  void goToKey(key)
}, 120)

const onNavSelect = (payload: { index: number; item: GooeyNavItem }) => {
  const key = tabs[payload.index]?.key
  if (!key) return
  debouncedGoToKey(key)
}

onBeforeUnmount(() => {
  debouncedGoToKey.cancel()
})

const progressWidth = computed(() => progress.state.width.value)
const progressVisible = computed(() => progress.state.visible.value)
</script>

<style scoped>
/* 弹出框过渡动画 */
.popover-enter-active,
.popover-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

.popover-enter-to,
.popover-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.nav-shell {
  width: 750px;
  min-width: 750px;
  transform-origin: center;
}

@media (max-width: 899px) {
  .nav-shell {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100%;
    transform: none !important;
  }
}

/* 桌面：中间导航轨在极窄视口下略缩放（移动端由上一段覆盖） */
@media (max-width: 800px) {
  .nav-shell {
    width: 800px;
    transform: scale(calc(100vw / 800));
  }
}

.login-edge-shift {
  transform: translateX(var(--edge-shift, 0px));
}

.login-edge-shift:hover {
  transform: translateX(calc(var(--edge-shift, 0px) - 8px));
}

/* 详情页 main：与 .app-main-site 完全分离，便于单独调宽与留白 */
.app-main-wallpaper-detail {
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
  min-width: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem 0.75rem 2.5rem;
  overflow-x: clip;
}

@media (min-width: 900px) {
  .app-main-wallpaper-detail {
    padding: 1.25rem 1rem 2.5rem;
  }
}

.fixed-header {
  position: fixed;
  top: -100%;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: rgba(57, 57, 57, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: headerSlideDown 0.3s ease-out forwards;
}

@keyframes headerSlideDown {
  from {
    top: -100%;
    opacity: 0;
  }

  to {
    top: 0;
    opacity: 1;
  }
}

[data-theme="light"] .fixed-header {
  background-color: rgba(255, 255, 255, 0.95);
}
</style>
